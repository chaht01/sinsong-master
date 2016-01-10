'use strict';

var app = angular.module('certApp');

app
	.directive("sinEditor", function ($timeout) {
		return {
			restrict: "A",
			scope: {
				entries: "=sinEntries",
				submit: "&sinSubmit",
				footer: "=footer",
				type: "=type",
				value: "=value",
				class: "=sinClass",
				autofocus: "=sinAutofocus"
			},
			controller: function ($scope, $sce) {
				console.log($scope.entries)
				$scope.users = [];
				$scope.editor;
				$scope.hash = {
					ele: angular.element('<input ng-model="hash.typed" ng-trim="false" class="hash-input" ng-focus="hash.inCaret=true" ng-blur="hash.inCaret=false" autofocus="true" kr-input>'),
					typed: '',
					submit: false, //selected hash or false
					constructed: false,
					inCaret: false,
					hashing: false
				};

				var dummyCvtStringToSafeHtml = '<span class="fn-dummy-safe"></span>';
				var isEditing = $scope.value;
				initEditor();

				function initEditor() {
					var contents;

					if (isEditing) {
						contents = dummyCvtStringToSafeHtml + $scope.value.text;
					} else {
						contents = dummyCvtStringToSafeHtml;
					}
					$scope.editor = {
						caret: {},
						blured: false,
						value: contents
							//
					};
				}
				$scope.pushEntry = function (htmlText) {
					htmlText = htmlText.replace(dummyCvtStringToSafeHtml, '');
					var obj = {
						id: $scope.value ? $scope.value.id : undefined,
						text: htmlText,
						model: $scope.entries ? $scope.entries : undefined
							/*
							the key names (eg.'text') must sync with directive's 
							attirbute parameter of function 'submit'.
							*/
					}
					if (obj.text.length !== 0) {
						$scope.submit(obj);
						if (isEditing) {
							$scope.value.text = htmlText;
							$scope.value.trustText = $sce.trustAsHtml(htmlText);
							$scope.value.edit = false;
						} else {
							initEditor();
						}
					}
				}
			},
			templateUrl: '/partials/partial-editor-body.html',
			link: function ($scope, element, attrs) {

				var editor = element.find("#note");
				editor.bind('keydown', 'alt+s', function (event) {
					$scope.pushEntry($scope.editor.value);
					event.preventDefault();
				})

				if($scope.autofocus){
				$timeout(function () {
					placeCaretAtEnd(editor[0]);
				})
				}
			}
		};
	})
	.directive("sinTypeahead", function ($filter) {
		return {
			restrict: "A",
			require: "^sinEditor",
			scope: {
				hash: "=sinHash"
			},
			controller: function ($scope, $filter, HashList) {
				$scope.hashlist = HashList.get();
				$scope.focusIndex = 0;

				$scope.$watch('hash.typed', function (newValue) {
					if ($scope.hash.constructed) {
						if ($scope.hash.typed.length != 0) {
							$scope.filteredResult = $filter('filter')($scope.hashlist, {
								name: newValue.substring(1)
							});
							$scope.focusIndex = 0;
						} else {
							$scope.focusIndex = null;
						}
					}
				})
				$scope.cvtCurrentHash = function () {
					if ($scope.filteredResult.length != 0) {
						return {
							typed: $scope.filteredResult[$scope.focusIndex].name
						}
					} else {
						return false;
					}
				}
				$scope.submitByClick = function (index, $event) {
					$scope.focusIndex = index;
					$event.preventDefault();
					$scope.hash.submit = $scope.cvtCurrentHash();
				};
				$scope.hoverIndex = function (index) {
					$scope.focusIndex = index;
				};

			},
			templateUrl: 'partials/partial-typeahead.html',
			link: function ($scope, element, attrs) {
				var hashInput = $scope.hash.ele;
				hashInput
					.bind('keydown', 'down', function (e) {
						$scope.focusIndex++;
						$scope.focusIndex %= $scope.filteredResult.length;
						$scope.$apply();
						e.preventDefault();
					})
					.bind('keydown', 'up', function (e) {
						$scope.focusIndex--;
						$scope.focusIndex += $scope.filteredResult.length;
						$scope.focusIndex %= $scope.filteredResult.length;
						$scope.$apply();
						e.preventDefault();
					})
					.bind('keydown', 'return', function (e) {
						$scope.hash.submit = $scope.cvtCurrentHash();
						e.preventDefault();
					});
			}
		}
	})
	.directive("sinNote", function ($compile, $timeout, $sce) {
		return {
			restrict: "A",
			require: "ngModel",
			scope: {
				hash: "=sinHash"
			},
			controller: function ($scope) {
				$scope.users = [];
			},
			link: function ($scope, element, attrs, ngModel) {

				function read() {
					setTimeout(function () {
						ngModel.$setViewValue(element.html());
					}, 100)
				}

				ngModel.$render = function () {
					element.html(ngModel.$viewValue || "");
				};

				var
					hashInput = $scope.hash.ele,
					hashInputTyped,
					editor = element,
					hashChar = '@';

				editor
					.bind("blur keyup change", function () {
						$scope.$apply(read);
						// $scope.$evalAsync(read)
					})
					.bind('keydown', 'shift+2', function (event) {
						if (!$scope.hash.constructed) {
							insertNodeAtCursor(hashInput.get(0));
							hashInput
								.autoGrowInput({
									minWidth: 10,
									comfortZone: 10
								}).focus();
							$scope.hash.constructed = true;
							$compile(hashInput)($scope);
						}
					});

				hashInput
					.bind('keydown', 'space esc', function (e) {
						$scope.finishHash();
						e.preventDefault();
					});

				$scope.$watch('hash.typed', function () {
					if ($scope.hash.constructed) {
						if ($scope.hash.typed.length === 0) {
							$scope.finishHash();
						} else {
							if ($scope.hash.typed.charAt(0) !== hashChar) {
								$scope.finishHash();
							}
						}
					}
				});

				$scope.$watch('hash.inCaret', function (newValue, oldValue, scope) {
					if (!newValue) {
						$scope.finishHash();
					}
				});

				$scope.$watch('hash.submit', function (newValue) {
					if (newValue) {
						$scope.finishHash();
					}
				})

				$scope.finishHash = function () {
					if ($scope.hash.constructed && !$scope.hash.hashing) {
						$scope.hash.hashing = true; //start hashing process
						if (!$scope.hash.submit) {
							replaceHashWith($scope.hash.typed);
						} else {
							$scope.users.push($scope.hash.submit);
							hashInputTyped = angular.element('<input value=' +
								$scope.users[$scope.users.length - 1].typed +
								' class="hash-input readonly" readonly>');
							replaceHashWith(hashInputTyped,
								function () {
									hashInputTyped.autoGrowInput({
										minWidth: 10,
										comfortZone: 0
									});
									hashInputTyped.next('span').remove();
									hashInputTyped.next('span').remove();
								});

						}
						$scope.hash.hashing = false; //end hashing process
					}
				};

				function initHash() {
					$scope.hash = {
						ele: angular.element('<input ng-model="hash.typed" ng-trim="false" class="hash-input" ng-focus="hash.inCaret=true" ng-blur="hash.inCaret=false" autofocus="true" kr-input>'),
						typed: '',
						submit: false,
						focus: false,
						inCaret: false,
						hashing: false
					};
				};

				function replaceHashWith(ele, callback) {
					$timeout(function () {
						if (typeof ele.get !== 'function' &&
							typeof ele === 'string') { //if ele is string
							insertTextAtCursor(ele);
						} else if (typeof ele.get === 'function') {
							if (ele.get(0).nodeType === 1) { //if ele's nodetype is element
								insertNodeAtCursor(ele.get(0))
							}
						}
					}).then(function () {
						if (typeof callback !== 'undefined') {
							callback();
						}
					})

					destroyHash();
					initHash();
				};

				function destroyHash() {
					$timeout(function () {
						hashInput.next('span').remove();
						hashInput = hashInput.detach();
						$scope.hash.constructed = false;
						$compile(hashInput)($scope);
						read();
					})
				};
			}
		};
	})