'use strict';

angular.module('certApp')
    .controller('Tab1Ctrl', ['$scope', '$sce','$rootScope',
        function($scope, $sce, $rootScope) {
            $scope.todos = [];
            $scope.submit = function(todo) {
                $scope.todos.push({
                        text: todo,
                        trustText: $sce.trustAsHtml(todo),
                        done: false
                    });
            };

            $scope.panel = {
                visible :false,
                x:0,
                y:0,
                model:null,
                event:null
            }
            $scope.card = {
                visible:false,
                model:null
            }
            $scope.deleteNews = function(){
                $scope.panel.visible = false;
                var res, curr = $scope.panel.event.currentTarget, flag = false;
                while(!flag){
                    res = curr.className.split(" ");
                    for (var i=0; i<res.length; i++){
                        if(res[i] == 'card-rotateX'){
                            flag = true;
                            break;
                        }
                    }
                    if(!flag)
                        curr = curr.parentNode;
                }
                $(curr).find(".figure.back").width(curr.offsetWidth);
                $(curr).find(".figure.back").height(curr.offsetHeight);
                $scope.panel.model.readyToDelete = true;
            }
            $scope.undoDelete = function(todo){
                todo.readyToDelete = false;
            }
            $scope.panelToggle = function($event,todo){
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.rootPanel = $scope.panel;
                if(todo==$scope.panel.model){
                    $scope.panel.visible = !$scope.panel.visible;
                }else{
                    $scope.panel.model = todo;
                    $scope.panel.event = $event;
                    $scope.panel.visible = true;
                    $scope.panel.x=$($event.currentTarget).offset().left+$($event.currentTarget).width();
                    $scope.panel.y=$($event.currentTarget).offset().top+$($event.currentTarget).height();
                }
            }
        }
    ]);

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

function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

