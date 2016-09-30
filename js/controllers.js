myApp.controller("HeaderCtrl", ['$scope', '$window', '$cookies', '$location', '$timeout', 'UserAuthFactory',
  function ($scope, $window, $cookies, $location, $timeout, UserAuthFactory) {

    var self = this;

    self.showMenu = false;
    self.verifiedUser = false;
    self.administrator = false;

    if ($cookies.get("token")) {

      UserAuthFactory.getUser().success(function (data) {
        self.showMenu = true;

        $window.sessionStorage.setItem("user", JSON.stringify(data.user));

        self.name = JSON.parse($window.sessionStorage.getItem("user")).name;
        self.verifiedUser = JSON.parse($window.sessionStorage.getItem("user")).verified;
        self.administrator = JSON.parse($window.sessionStorage.getItem("user")).administrator;
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

myApp.controller("HomeCtrl", ['$scope', '$sce', '$location', 'ArticleFactory',
  function ($scope, $sce, $location, ArticleFactory) {

    var self = this;

    ArticleFactory.getArticles().success(function (data) {
      if (data.success) {

        self.olderArticles = [];

        //We are sorting the articles on the server so when we receive them
        // index 0 will always be the newest.

        self.mainArticleLeft = {
          articleTitle: data.articles[0].title,
          articleAuthor: data.articles[0].author,
          articleDate: data.articles[0].updateDate,
          articleContent: $sce.trustAsHtml( data.articles[0].text.substring(0, 300 ).trim( ) + "..." )
        };

        self.mainArticleRight = {
          articleTitle: data.articles[1].title,
          articleAuthor: data.articles[1].author,
          articleDate: data.articles[1].updateDate,
          articleContent: $sce.trustAsHtml( data.articles[1].text.substring(0, 300 ).trim( ) + "..." )
        };

        data.articles.splice( 0, 2 );


        for( var i = 0; i < data.articles.length; i++ )
        {
          self.olderArticles.push({
            articleTitle: data.articles[i].title,
            articleAuthor: data.articles[i].author,
            articleDate: data.articles[i].updateDate,
            articleContent: $sce.trustAsHtml( data.articles[i].text.substring(0, 300 ).trim( ) + "..." )
          });
        }



      }
    });


  }
]);

myApp.controller("ProfileCtrl", ['$scope', '$location', '$cookies',
  function ($scope, $location, $cookies) {
    var self = this;

    if (!$cookies.get('token')) $location.path("/");


    self.test = 'This is a profile page';

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

myApp.controller("ArticleCtrl", ['$scope', '$location',
  function ($scope, $location) {
    var self = this;
  }
]);

myApp.controller("SubmitArticleCtrl", ['$scope', '$window', '$location', '$cookies', 'ArticleFactory',
  function ($scope, $window, $location, $cookies, ArticleFactory) {
    var self = this;

    var submitArticleFlag = JSON.parse($window.sessionStorage.getItem("user")).submitArticleFlag;

    if (! $cookies.get('token') || ! submitArticleFlag ) $location.path("/");

    self.submitArticle = function () {

      self.article.author = JSON.parse($window.sessionStorage.getItem("user")).name;
      self.article.updateDate = new Date();

      ArticleFactory.submitArticle(self.article).success(function (data) {
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

    //Init Grid Options
    self.gridOptions = {
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: false
    };
 
    self.gridOptions.columnDefs = [
      { name: 'id' },
      { name: 'name'},
      { name: 'email' }
    ];

    self.gridOptions.data = [
      {
        "id": "001",
        "name": "Alex Clark",
        "email": "test1@test.com"
      },
      {
        "id": "002",
        "name": "Bob Smith",
        "email": "test2@test.com"
      },
      {
        "id": "003",
        "name": "John Miller",
        "email": "test3@test.com"
      }
    ];

    self.gridOptions.onRegisterApi = function(gridApi){
      //set gridApi on scope
      self.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        currSelectedUser = row.entity;
      });
    };

    //Button Listener
    self.verifyUser = function( ) {
      var idx = 0;

      AdminFactory.verifyUser( currSelectedUser );

      //On success
      for( ; idx <= self.gridOptions.data.length; idx++ )
      {
        if( self.gridOptions.data[idx].email === currSelectedUser.email ) {
          self.gridOptions.data.splice(idx,1);
          break;
        }
      }

    }

  }
]);


