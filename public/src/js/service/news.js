'use strict';

var app = angular.module('certApp');

app.factory('News', function($resource,$sce) {
        /*return $resource(window.api_url+'/users/:userId', {
                userId: '@userId',
                page: 1,
                per_page: 100
            }, {
                query: {
                    method: 'GET'
                },
                post:{
                    method: 'POST'
                }
            }
        );
*/

var test = [
{text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eu venenatis enim. Vivamus consequat, mi vel blandit pretium, urna velit bibendum augue, ac ultricies diam lectus non tellus. Suspendisse potenti. Pellentesque dapibus mauris tellus, at consequat dolor luctus sed. Etiam hendrerit dolor sem, in malesuada ex pharetra eget. Duis at erat elementum, dignissim tortor eu, feugiat sem. Donec massa leo, aliquam id pretium sed, venenatis at augue. Cras sodales eu arcu eu placerat. Maecenas pellentesque volutpat quam vel lobortis.',
 trustText: $sce.trustAsHtml(this.text)
},
{text:'Vestibulum sodales mi vitae bibendum posuere. Sed in consectetur orci. Integer varius massa sit amet justo facilisis bibendum. Maecenas eu pulvinar lacus. Fusce malesuada quis ex vel maximus. Integer fringilla nisi felis, a fermentum quam mattis id. Suspendisse dictum, mauris ac sollicitudin consectetur, metus mi condimentum est, id tincidunt lectus lacus tincidunt elit. Morbi commodo fermentum finibus. Nullam facilisis urna placerat erat placerat, non tristique augue molestie. Aenean interdum et eros ac tristique. Ut interdum nunc a elementum placerat. Proin et neque dictum, imperdiet justo quis, ultricies dolor. Mauris pretium mattis ullamcorper.',
trustText: $sce.trustAsHtml(this.text)
},
{text:'<input value="정진혁" class="hash-input readonly" readonly="" style="width: 47px;">ㅇㄹㄴㅁㄹㄴ<input value="정진혁" class="hash-input readonly" readonly="" style="width: 47px;">',
trustText: $sce.trustAsHtml(this.text)
}]
return {
	get: function(){
		return test
	}
}
});