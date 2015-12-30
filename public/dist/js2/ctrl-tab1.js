'use strict';

angular.module('certApp')
    .controller('Tab1Ctrl', ['$scope', '$sce', '$compile', '$timeout', 'HashList', 'Upload', function($scope, $sce, $compile, $timeout, HashList, Upload) {

        $scope.todos = [];
        $scope.text = {
            value: ''
        };
        $scope.user = {
            typed: '',
            submit: false,
            focus: false
        };
        $scope.users = [];
        $scope.editor = {
            ele: angular.element("#note"),
            caret: {},
            blured: false
        };

        var
            hashInput = angular.element('<input ng-model="user.typed" ng-trim="false" class="hash-input" ng-blur="blurFocus()" autofocus="true" ng-submit="">'),
            hashInputTyped,
            formEle = angular.element('<form id="hash-form" ng-submit="submitHash()"></form>');

        $scope.editor.ele.bind('keydown', 'shift+2', function(event) {
            if (!$scope.user.focus) {
                insertNodeAtCursor(formEle.get(0))
                hashInput.appendTo(angular.element('#hash-form')).autoGrowInput({
                    minWidth: 10,
                    comfortZone: 10
                }).focus();
                $scope.user.focus = true;
                $compile(formEle)($scope);
            }
        })

        $scope.blurEditor = function(bool) {
            $scope.editor.blured = bool;
        }

        $scope.$watch('user.typed', function() {
            if ($scope.user.focus) {
                if ($scope.user.typed.length == 0) {
                    $scope.destroyHash()
                    $scope.user.focus = false;
                } else {
                    $scope.focusIndex = 0;
                }
            }
        })
        hashInput.bind('keydown', 'space', function(e) {
            $scope.destroyHash();
            $scope.hashToPlain();
            $scope.user.focus = false;
            e.preventDefault();
        }).bind('keydown', 'down', function(e) {
            $scope.focusIndex++;
            $scope.focusIndex %= $scope.filteredResult.length;
            $scope.$apply();
            e.preventDefault();
        }).bind('keydown', 'up', function(e) {
            $scope.focusIndex--;
            $scope.focusIndex += $scope.filteredResult.length;
            $scope.focusIndex %= $scope.filteredResult.length;
            $scope.$apply();
            e.preventDefault();
        }).bind('keydown', 'esc', function(e) {
            $scope.destroyHash();
            $scope.hashToPlain();
            $scope.user.focus = false;
            e.preventDefault();
        })
        $scope.hashToPlain = function() {
            insertTextAtCursor($scope.user.typed);
            $scope.user = {
                typed: '',
                submit: false,
                focus: false
            };
        }
        $scope.focusme = function() {
            $scope.editor.ele.focus();
            restortSelection($scope.editor.ele.get(0), $scope.editor.caret);
        }
        $scope.saveCaret = function() {
            $scope.editor.caret = saveSelection($scope.editor.ele.get(0));
            $scope.blurEditor(true);
        }
        $scope.submitHash = function() {
            $scope.user.submit = true;
            $scope.blurFocus();
        }
        $scope.blurFocus = function() {
            if ($scope.user.focus) {
                if ($scope.editor.blured && !$scope.user.submit) {
                    $scope.editor.ele.focus();
                    $scope.blurEditor(false);
                    restortSelection($scope.editor.ele.get(0), $scope.editor.caret);
                    $scope.destroyHash();
                    $scope.hashToPlain();
                    $scope.user.focus = false;
                    return;
                }
                if ($scope.filteredResult.length != 0) {
                    var obj = {
                        typed: $scope.filteredResult[$scope.focusIndex].name
                    }
                    $scope.users.push(obj);
                    hashInputTyped = angular.element('<input value=' + $scope.users[$scope.users.length - 1].typed + ' class="hash-input readonly" readonly>');
                    $scope.destroyHash();
                    insertNodeAtCursor(hashInputTyped.get(0));
                    hashInputTyped.autoGrowInput({
                        minWidth: 10,
                        comfortZone: 0
                    });
                    $scope.user = {
                        typed: '',
                        submit: false,
                        focus: false
                    };
                    hashInputTyped.next('span').remove();
                    $scope.user.focus = false;
                } else {
                    $scope.destroyHash();
                    $scope.hashToPlain();
                    $scope.user.focus = false;
                }
            }
        }

        $scope.destroyHash = function() {
            formEle.detach()
            $compile(formEle)($scope);
        }

        $scope.submit = function() {
            if ($scope.text.value) {
                $scope.todos.push({
                    text: $scope.text.value,
                    trustText: $sce.trustAsHtml($scope.text.value),
                    done: false
                });
                $scope.text.value = '';
            }
        }

        $scope.editor.ele.bind('keydown', 'alt+s', function(event) {
            $scope.submit();
            event.preventDefault();
        })

        $scope.userlist = HashList.get();
    }]);

/**
 * dom element를 현재 cursor caret 위치에 삽입
 * @param  {node}
 */
function insertNodeAtCursor(node) {
    var sel, range, node;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = window.getSelection().getRangeAt(0);
            node = node;
            range.insertNode(node);
            /* 커서 위치를 삽입한 노드 뒤에 위치 시킨다 */
            range.setStartAfter(node);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().pasteHTML(html);
    }
}

/**
 * plain text를 현재 cursor caret 위치에 삽입
 * @param  {text}
 */
function insertTextAtCursor(text) {
    var sel, range, html;
    sel = window.getSelection();
    range = sel.getRangeAt(0);
    range.deleteContents();
    var textNode = document.createTextNode(text);
    range.insertNode(textNode);
    /* 커서 위치를 삽입한 노드 뒤에 위치 시킨다 */
    range.setStartAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);
}

function saveSelection(containerEl) {
    if (window.getSelection && document.createRange) {

        var range = window.getSelection().getRangeAt(0);
        var preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(containerEl);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        var start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length
        }
    } else if (document.selection && document.body.createTextRange) {

        var selectedTextRange = document.selection.createRange();
        var preSelectionTextRange = document.body.createTextRange();
        preSelectionTextRange.moveToElementText(containerEl);
        preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
        var start = preSelectionTextRange.text.length;

        return {
            start: start,
            end: start + selectedTextRange.text.length
        }
    }
}

function restortSelection(containerEl, savedSel) {
    if (window.getSelection && document.createRange) {
        var charIndex = 0,
            range = document.createRange();
        range.setStart(containerEl, 0);
        range.collapse(true);
        var nodeStack = [containerEl],
            node, foundStart = false,
            stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(containerEl);
        textRange.collapse(true);
        textRange.moveEnd("character", savedSel.end);
        textRange.moveStart("character", savedSel.start);
        textRange.select();
    }
}