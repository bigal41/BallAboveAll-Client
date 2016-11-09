//B411Ab0v3A11
var apiAddress = "http://ballaboveall.ralexclark.ca:8080/api";

myApp.factory('UserAuthFactory', function( $window, $location, $cookies, $http ) {



   return {
      login: function(username, password){
         return $http.post( apiAddress + "/login",{username: username, password: password});
      },

      getUser: function( token ){

         var config = {
            headers : {
                'Authorization': token
            }
        }

         return $http.get( apiAddress + "/user",config);
      },

      register: function(user) {
         return $http.post( apiAddress + "/register", {user: user})
      },

      retrievePassword :function(email) {
          return $http.post( apiAddress + "/forget", {email: email})
      },

      resetPassword: function(token, password) {
          return $http.post( apiAddress + "/reset", {token: token, password: password});
      }
   }
})

myApp.factory('ArticleFactory', function( $http, $cookies ) {

    return {
        submitArticle: function( article, author, token ) {

            var config = {
                headers : {
                    'Authorization': token,
                    'Content-Type' : 'application/json'
                }
            }

            return $http.post( apiAddress + "/submitArticle", { article: article, user: author }, config );
        },

        getArticles: function( article ) {

            return $http.get(apiAddress + "/articles");

        },

        getArticlesByUser: function( username ) {
            return $http.post( apiAddress + "/articlesByUser", { username: username } );
        },

        getArticleByID: function( id ) {
            return $http.post( apiAddress + "/articleByID", {id: id });
        }

    }
});

myApp.factory('AdminFactory', function( $http, $cookies ){
   return {

      //User Admin - getting users needed verification and verifying users.
      pendingVerification : function( ) {

         return $http.get( apiAddress + "/pendingVerification" );

      },

      verifyUser : function( user, token ) {

         var config = {
            headers : {
               'Authorization': token,
               'Content-Type' : 'application/json'
            }
         }

         //NOTE: Should we send the user that is verifying the user? That way we can track the admin who
         //did the verifiction and make sure they are an admin.
         return $http.post(apiAddress + "/verifyUser", { user: user }, config );

      },

      //Article Admin - getting the articles that need to be approved and approve the articles
      pendingApproval : function( ) {
         return $http.get( apiAddress + "/pendingApproval");
      },

      approveArticle : function( article, token ) {
         var config = {
            headers: {
               'Authorization': token,
               'Content-Type' : 'application/json'
            }
         };

         //NOTE: Should we send the user that is approving the article? That way we can track the admin who
         //did the approval and make sure they are an admin.
         return $http.post(apiAddress + '/approveArticle', { article, article }, config );

      }

   }
});

myApp.factory('UserFactory', function( $http, $cookies ){
    return {

        getProfileByUser : function( username ) {
            return $http.post( apiAddress + "/profileByUser", { username: username } );
        }

    }
});
