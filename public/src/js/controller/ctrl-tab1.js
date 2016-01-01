'use strict';

angular.module('certApp')
.controller('Tab1Ctrl', ['$scope', '$sce','$rootScope','News',
    function($scope, $sce, $rootScope, News) {

        $scope.todos = News.get();
        angular.forEach($scope.todos, function(todo, key){
            todo.trustText = $sce.trustAsHtml(todo.text)
        });
        $scope.editList =[];
        $scope.submit = function(todo) {
            $scope.todos.push({
                text: todo,
                trustText: $sce.trustAsHtml(todo),
                edit:false
            });
        };

        $scope.popover = {
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

        $scope.popoverToggle = function($event,todo){
            $event.stopPropagation();
            $event.preventDefault();
            $rootScope.rootPopover = $scope.popover;
            if(todo==$scope.popover.model){
                $scope.popover.visible = !$scope.popover.visible;
            }else{
                $scope.popover.model = todo;
                $scope.popover.event = $event;
                $scope.popover.visible = true;
                $scope.popover.x = $($event.currentTarget).offset().left+$($event.currentTarget).width();
                $scope.popover.y = $($event.currentTarget).offset().top+$($event.currentTarget).height();
            }
        }


        /**
         * delete news related functions
         * delete & undo
         */
         $scope.deleteNews = function(){
            $scope.popover.visible = false;
            var res, curr = $scope.popover.event.currentTarget, flag = false;
            var targetClass = "rotateX"
            while(!flag){
                res = curr.className.split(" ");
                for (var i=0; i<res.length; i++){
                    if(res[i] == targetClass){
                        flag = true;
                        break;
                    }
                }
                if(!flag)
                    curr = curr.parentNode;
            }
            $(curr).find(".figure.back").width(curr.offsetWidth);
            $(curr).find(".figure.back").height(curr.offsetHeight);
            $scope.popover.model.readyToDelete = true;
        }
        $scope.undoDelete = function(todo){
            todo.readyToDelete = false;
        }

        /**
         * edit news related function
         * edit & confirm & undo
         */
        
        $scope.editNews = function(){
            $scope.popover.model.edit = true;
            // $scope.editList.push($scope.popover.model);
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

