'use strict';

angular.module('certApp')
	.controller('Tab1Ctrl', ['$scope', '$sce', '$rootScope', 'News',
	function ($scope, $sce, $rootScope, News) {

			$scope.newses = News.get();
			angular.forEach($scope.newses, function(news,index){
				news.trustText = $sce.trustAsHtml(news.text);
				angular.forEach(news.comments, function(comment,index){
					comment.trustContext = $sce.trustAsHtml(comment.context);
				})
			})
			$scope.editList = [];
			$scope.addNews = function (text,model) {
				model.push({
					text: text,
					trustText: $sce.trustAsHtml(text),
					edit: false,
					comments:[]
				});
			};

			$scope.editNewsEnd = function (id, news) {
				News.edit({
					id: id,
					text:news,
					trustText: $sce.trustAsHtml(news),
					edit: false
				})	
			}


			$scope.popover = {
				visible: false,
				x: 0,
				y: 0,
				model: null,
				event: null
			}

			$scope.popoverToggle = function ($event, news) {
				$event.stopPropagation();
				$event.preventDefault();
				$rootScope.rootPopover = $scope.popover;


				if (news == $scope.popover.model) {
					$scope.popover.visible = !$scope.popover.visible;
				} else {
					$scope.popover.model = news;
					$scope.popover.visible = true;
				}
				$scope.popover.event = $event;
				$scope.popover.x = $($event.currentTarget).offset().left + $($event.currentTarget).width();
				$scope.popover.y = $($event.currentTarget).offset().top + $($event.currentTarget).height();
			}


			/**
			 * delete news related functions
			 * delete & undo
			 */
			$scope.deleteNewsStart = function () {
				$scope.popover.visible = false;
				var res, curr = $scope.popover.event.currentTarget,
					flag = false;
				var targetClass = "rotateX"
				while (!flag) {
					res = curr.className.split(" ");
					for (var i = 0; i < res.length; i++) {
						if (res[i] == targetClass) {
							flag = true;
							break;
						}
					}
					if (!flag)
						curr = curr.parentNode;
				}
				$(curr).find(".figure.back").width(curr.offsetWidth);
				$(curr).find(".figure.back").height(curr.offsetHeight);
				$scope.popover.model.readyToDelete = true;
			}
			$scope.deleteNewsUndo = function (news) {
				news.readyToDelete = false;
			}
			$scope.deleteNewsEnd = function (news) {
				news.deleted = true;
				//server side code below
			}
			/**
			 * edit news related function
			 * edit & confirm & undo
			 */

			$scope.editNewsStart = function () {
				$scope.popover.model.edit = true;
//				$scope.editList.push($scope.popover.model);
			}
			
			$scope.addComment = function(text, model){
				model.push({
					name: '테스트',
					context: text,
					trustContext: $sce.trustAsHtml(text)
				});
			}
      }
      ]);

