'use strict';

angular.module('certApp').controller('IndexCtrl', function($scope, RouteLinkProvider){
    $scope.section = '';
    $scope.link_provider = RouteLinkProvider;
    $scope.sidebarObjects = [
        {
            title: '',
            buttons: [
                {
                    name: '신송1',
                    link: 'tab1',
                    icon: 'glyphicons glyphicons-globe'
                },
                {
                    name: '신송2',
                    link: 'inspect',
                    icon: 'glyphicon-ok'
                },
                {
                    name: '신송3',
                    link: 'analysis-report',
                    icon: 'glyphicon-stats'
                }
            ]
        }
    ]
})
