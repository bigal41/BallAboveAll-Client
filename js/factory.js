//B411Ab0v3A11
var apiAddress = "http://localhost:8080/api";

myApp.factory('UserAuthFactory', function( $window, $location, $cookies, $http ) {
   
   
   
   return {
      login: function(username, password){
         return $http.post( apiAddress + "/login",{email: username, password: password});
      },

      getUser: function(){

         var config = {
            headers : {
                'Authorization': $cookies.get('token')
            }
        }

         return $http.get( apiAddress + "/getUser",config);
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
        submitArticle: function( article ) {

            var config = {
                headers : {
                    'Authorization': $cookies.get('token'),
                    'Content-Type' : 'application/json'
                }
            }

            return $http.post( apiAddress + "/submitArticle", { article: article }, config );
        },

        getArticles: function( article ) {

            return $http.get(apiAddress + "/getArticles");

        }
    }
});

myApp.factory('AdminFactory', function( $http, $cookies ){
  return {

    pendingVerification : function( ) {

        return $http.get( apiAddress + "/pendingVerification" );

    },

    verifyUser : function( user ) { 

       var config = {
            headers : {
               'Authorization': $cookies.get('token'),
               'Content-Type' : 'application/json'
            }
         }

       //Should we send the user that is verifying the user? That way we can track the admin who
       //did the verifiction and make sure they are an admin.
       return $http.post(apiAddress + "/verifyUser", { user: user }, config );

    }

  }
});