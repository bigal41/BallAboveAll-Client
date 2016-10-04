var myApp = angular.module('ballAboveAll', ['ngRoute', 
                                            'ngCookies', 
                                            'ngSanitize', 
                                            'toaster', 
                                            'colorpicker.module', 
                                            'wysiwyg.module', 
                                            'ui.grid',
                                            'ui.grid.selection']);

myApp.config(function ($routeProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
      controllerAs: 'homectrl'
    }).when('/registration', {
      templateUrl: 'partials/registration.html',
      controller: 'RegistrationCtrl',
      controllerAs: 'registrationctrl'
    }).when('/profile/:username', {
      templateUrl: 'partials/profile.html',
      controller: 'ProfileCtrl',
      controllerAs: 'profilectrl'
    }).when('/submitArticle',{
      templateUrl: 'partials/submitArticle.html',
      controller: 'SubmitArticleCtrl',
      controllerAs: 'submitartlcectrl'
    }).when('/forget',{
      templateUrl: 'partials/forget.html',
      controller: 'ForgetPasswordCtrl',
      controllerAs: 'forgetctrl'
    }).when('/reset/:token',{
      templateUrl: 'partials/reset.html',
      controller: 'ResetPasswordCtrl',
      controllerAs: 'resetctrl'
    }).when('/admin',{
      templateUrl: 'partials/admin.html',
      controller: 'AdminCtrl',
      controllerAs: 'adminctrl' 
    }).when('/article/:id',{
      templateUrl: 'partials/articles/fullarticle.html',
      controller: 'ArticleCtrl',
      controllerAs: 'articlectrl'
    }).otherwise({
      redirectTo: '/'
    });
});