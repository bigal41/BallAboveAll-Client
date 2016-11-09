var failedPathChange = false,
    msg = '';

myApp.controller("HeaderCtrl", ['$scope', '$window', '$cookies', '$location', '$timeout', 'UserAuthFactory',
  function ($scope, $window, $cookies, $location, $timeout, UserAuthFactory) {

    var self = this;

    self.showMenu = false;
    self.verifiedUser = false;
    self.administrator = false;

    if ($cookies.get("token") || $window.sessionStorage.getItem("token" )) {

      UserAuthFactory.getUser( $cookies.get('token') != null ? $cookies.get('token') : $window.sessionStorage.getItem("token" ) ).success(function (data) {
        self.showMenu = true;

        $window.sessionStorage.setItem("user", JSON.stringify(data.user));

        self.name = JSON.parse($window.sessionStorage.getItem("user")).name;
        self.verifiedUser = JSON.parse($window.sessionStorage.getItem("user")).verified;
        self.administrator = JSON.parse($window.sessionStorage.getItem("user")).administrator;
        self.username = JSON.parse($window.sessionStorage.getItem("user")).username;
      });

    }

    self.isActive = function (route) {
      return route === $location.path();
    }

    self.login = function () {

      if (self.user.username !== undefined && self.user.password) {

        UserAuthFactory.login(self.user.username, self.user.password).success(function (data) {

          if( data.success ) {

            //Note we need to check if the login actually succeded
            if (self.saveToken)
              $cookies.put("token", data.token);
            else
              $window.sessionStorage.setItem("token", data.token);

            $window.sessionStorage.setItem("user", JSON.stringify(data.user));

            self.showMenu = data.success;
            self.name = data.user.name;
            self.verifiedUser = data.user.verified;
            self.administrator = data.user.administrator;
            self.username = JSON.parse($window.sessionStorage.getItem("user")).username;
          }

          else { console.log('Unable to log in....') }

        }).error(function (status) {
          console.log('Unable to log in...' + status);
        });
      }
    }

    self.logout = function () {
      self.showMenu = false;
      self.name = "";

      $cookies.remove("token");
      $window.sessionStorage.removeItem("token");

      if ($window.sessionStorage.getItem("user"))
          $window.sessionStorage.removeItem("user");

      //Later we need to check if the user should leave the page they are on.

    }

  }
]);

myApp.controller("RegistrationCtrl", ['$scope', '$location', 'UserAuthFactory',
  function ($scope, $location, UserAuthFactory) {

    var self = this;

    self.register = function () {
      UserAuthFactory.register(self.newUser).success(function (data) {
        console.log(data);
        if (data.success)
          $location.path('/');
      });
    }

  }
]);

myApp.controller("HomeCtrl", ['$scope', '$sce', '$location', 'toaster', 'ArticleFactory',
  function ($scope, $sce, $location, toaster, ArticleFactory) {

    var self = this;

    ArticleFactory.getArticles().success(function (data) {
      if (data.success) {

        self.olderArticles = [];

        //We are sorting the articles on the server so when we receive them
        // index 0 will always be the newest.

        if( data.articles.length > 0 ) {

            self.mainArticleLeft = {
               articleID: data.articles[0]._id,
               articleTitle: data.articles[0].title,
               articleAuthor: data.articles[0].author,
               articleDate: data.articles[0].updateDate,
               articleContent: $sce.trustAsHtml( data.articles[0].text.substring(0, 300 ).trim( ) + "..." ),
               authorUsername: data.articles[0].authorUsername
            };

            if( data.articles.length > 1 ) {

              self.mainArticleRight = {
                articleTitle: data.articles[1].title,
                articleAuthor: data.articles[1].author,
                articleDate: data.articles[1].updateDate,
                articleContent: $sce.trustAsHtml( data.articles[1].text.substring(0, 300 ).trim( ) + "..." ),
                authorUsername: data.articles[1].authorUsername
              };
            }
            data.articles.splice( 0, 2 );
         }


        for( var i = 0; i < data.articles.length; i++ )
        {
          self.olderArticles.push({
            articleTitle: data.articles[i].title,
            articleAuthor: data.articles[i].author,
            articleDate: data.articles[i].updateDate,
            articleContent: $sce.trustAsHtml( data.articles[i].text.substring(0, 300 ).trim( ) + "..." ),
            authorUsername: data.article[i].authorUsername
          });
        }



      }
    });

    toaster.pop('error','msg');

  }
]);

myApp.controller("ProfileCtrl", ['$scope', '$window', '$location', '$cookies', '$routeParams', '$sce', 'ArticleFactory', 'UserFactory',
   function ($scope, $window, $location, $cookies, $routeParams, $sce, ArticleFactory, UserFactory) {
      var self = this;

      self.username = $routeParams.username;
      self.articles = [];
      self.hasTwitter = false;

      ArticleFactory.getArticlesByUser( self.username ).success(function (data) {
         if (data.success)
         {
            for( var i = 0; i < data.articles.length; i++ )
            {
               self.articles.push({
                  articleTitle: data.articles[i].title,
                  articleAuthor: data.articles[i].author,
                  articleDate: data.articles[i].updateDate,
                  articleContent: $sce.trustAsHtml( data.articles[i].text.substring(0, 300 ).trim( ) + "..." )
               });
            }

         }
      });

      UserFactory.getProfileByUser( self.username).success( function(data) {
         if( data.success )
         {
            self.user = data.user;
            //Hardcoded for Demo -- REMOVE LATER
            self.user.twitterName = "RAlexClark";
            self.hasTwitter = true;
         }
      });
   }
]);

myApp.controller("ForgetPasswordCtrl", ['$scope', '$location', 'toaster', 'UserAuthFactory',
  function ($scope, $location, toaster, UserAuthFactory) {
    var self = this;

    self.retrievePassword = function () {

      if (self.curruser == undefined) toaster.pop('error', "No email entered.");
      else {
        UserAuthFactory.retrievePassword(self.curruser.email).success(function (data) {

          console.log(data);

          if (data.success) toaster.pop('success', data.msg);
          else toaster.pop('error', data.msg);
        });
      }

    }
  }
]);

myApp.controller("ResetPasswordCtrl", ['$scope', '$location', '$routeParams', '$timeout', 'toaster', 'UserAuthFactory',
  function ($scope, $location, $routeParams, $timeout, toaster, UserAuthFactory) {
    var self = this;

    self.resetPassword = function () {
      if (self.newPassword !== self.confirmPassword) toaster.pop('error', 'Passwords do not match');
      else {
        UserAuthFactory.resetPassword($routeParams.token, self.newPassword).success(function (data) {
          if (data.success) {
            toaster.pop('success', data.msg);
            $timeout(function () {
              $location.path('/');
            }, 2000);
          }
          else {
            toaster.pop('error', data.msg);

            $timeout(function () {
              $location.path('/forget');
            }, 2000);
          }
        })
      }
    }
  }
]);

myApp.controller("ArticleCtrl", ['$scope', '$location', '$routeParams', 'ArticleFactory',
  function ($scope, $location, $routeParams, ArticleFactory) {
    var self = this;

    self.articleID = $routeParams.id;

    ArticleFactory.getArticleByID( self.articleID ).success(function(data) {

      if(data.success) { self.article = data.article; }

    });
  }
]);

myApp.controller("SubmitArticleCtrl", ['$scope', '$window', '$location', '$cookies', 'ArticleFactory',
  function ($scope, $window, $location, $cookies, ArticleFactory) {
    var self = this;

    var submitArticleFlag = JSON.parse($window.sessionStorage.getItem("user")).submitArticleFlag;

    if ( ( ! $cookies.get('token')  && ! $window.sessionStorage.getItem("token" ) ) && ! submitArticleFlag ) $location.path("/");

    self.submitArticle = function () {

      self.author = JSON.parse($window.sessionStorage.getItem("user"));
      self.article.updateDate = new Date();

      ArticleFactory.submitArticle(self.article, self.author, $cookies.get('token') != null ? $cookies.get('token') : $window.sessionStorage.getItem("token" ) ).success(function (data) {
        if (data.success)
          $location.path('/');
        else
          console.log(data);
      });
    }
  }
]);

myApp.controller("AdminCtrl", ['$scope', '$window', '$location', '$cookies', 'AdminFactory',
  function($scope, $window, $location, $cookies, AdminFactory) {
    var self = this,
        currSelectedUser;

    if( !$window.sessionStorage.getItem('user') || ! JSON.parse( $window.sessionStorage.getItem('user') ).administrator ) {

      failedPathChange = true;
      msg = 'You are not an administrator. Please contact the admin to get security rights.';

      //Change Path
      $location.path('/');
    }
    else {
      //Init Verify User Grid Options
      self.usersGridOptions = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false
      };

      self.usersGridOptions.columnDefs = [
        { name: '_id', displayName: 'ID' },
        { name: 'name'},
        { name: 'email' }
      ];

      //Init Approve Article Grid Options
      self.articleGridOptions = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false
      };

      self.articleGridOptions.columnDefs = [
        { name: '_id', displayName: 'ID' },
        { name: 'title'},
        { name: 'content' }
      ];

      //Get all the users pending verification
      AdminFactory.pendingVerification( ).success( function(data) {
        self.usersGridOptions.data = data.users;
      });

      //Get all the articles that are pending approval
      AdminFactory.pendingApproval( ).success( function(data) {
         self.articleGridOptions.data = data.articles;
      });

      //We need to register the users grid
      self.usersGridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        self.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope,function(row){
          currSelectedUser = row.entity;
        });
      };

      //Now register the article grid
      self.articleGridOptions.onRegisterApi = function(gridApi) {
         self.gridApi= gridApi;
         gridApi.selection.on.rowSelectionChanged($scope, function(row){
            currSelectedArticle = row.entity;
         })
      };

      //Button Listener
      self.verifyUser = function( ) {
         var idx = 0;

         AdminFactory.verifyUser( currSelectedUser, $cookies.get('token') != null ? $cookies.get('token') : $window.sessionStorage.getItem("token" ) );

         //On success
         for( ; idx <= self.usersGridOptions.data.length; idx++ )
         {
            if( self.usersGridOptions.data[idx].email === currSelectedUser.email ) {
               self.usersGridOptions.data.splice(idx,1);
               break;
            }
         }
      };

      self.approveArticle = function( ) {
         var idx = 0;

         AdminFactory.approveArticle( currSelectedArticle, $cookies.get('token') != null ? $cookies.get('token') : $window.sessionStorage.getItem('token') );

         //On success -- should be a true on success. We are being optimistic here and assuming that
         //the following call to the API is going to succeed.
         for( ; idx <= self.articleGridOptions.data.length; idx++ )
         {
            if( self.articleGridOptions.data[idx].id === currSelectedArticle.id ) {
               self.articleGridOptions.data.splice(idx,1);
               break;
            }
         }
      }
    }
  }
]);
