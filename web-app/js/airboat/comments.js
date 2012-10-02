function addComment($form, changesetIdentifier) {

    var text = $form.find('textarea').val();
    if (text == "") {
        return false;
    }

    $.post(uri.userComment.addComment,
        { changesetIdentifier:changesetIdentifier, text:text },
        function (comment) {
            if (comment.errors == null) {
                var changeset = airboat.getModel('.changeset[data-identifier=' + changesetIdentifier + ']');
                var changesetComments = changeset.comments;
                $.observable(changesetComments).insert(changesetComments.length, comment);
                $.observable(changeset).setProperty('allComments');

                resetCommentForm($form);
                $('.validationErrorsToChangeset').html("");
            } else {
                $('.validationErrorsToChangeset')
                    .html($('#errorCommentTemplate').render(" Your comment is too long!"))
                    .hide().fadeIn();
            }
        },
        "json"
    );
}

function checkCanAddLineCommentAndShowForm($listingLine, projectFile) {
    var url = uri.lineComment.checkCanAddComment + '?' + $.param({
        changesetIdentifier:projectFile.changeset.identifier, projectFileId:projectFile.id
    });
    $.ajax({url:url}).done(function (response) {
        if (response.canAddComment) {
            createAndShowCommentFormPopover($listingLine, projectFile);
        } else {
            var cannotAddCommentMessage = $('#cannotAddLineCommentMessageTepmlate').render(response);
            $.colorbox({html:cannotAddCommentMessage});
        }
    })
}

function createAndShowCommentFormPopover($listingLine, projectFile) {
    var commentForm = $("#addLineCommentFormTemplate").render({
        changesetId:projectFile.changeset.identifier,
        fileId:projectFile.id,
        lineNumber:getLineNumber($listingLine)
    });
    removeLineCommentPopover($listingLine.parents('.fileListing'));

    $listingLine.parents('.fileListing').first().data('$commentedLine', $listingLine);
    $listingLine.popover({
        content:commentForm,
        placement:"left",
        trigger:"click",
        template:'<div class="popover lineCommentFormPopover"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>'
    });
    $listingLine.popover('show');
}

function getLineNumber($listingLine) {
    var diffSpanStartLine = airboat.getModel($listingLine[0]).newFileStartLine;
    var lineIndex = $listingLine.parents('pre').find('li').index($listingLine);
    return diffSpanStartLine + lineIndex;
}

function closeLineCommentForm(changesetIdentifier, projectFileId) {
    var $fileListing = $(
        '.changeset[data-identifier=' + changesetIdentifier + ']' +
        ' .fileListing.projectFile[data-id=' + projectFileId + ']'
    );
    removeLineCommentPopover($fileListing);
}

function addLineComment(changesetIdentifier, projectFileId, lineNumber) {
    var text = $('#add-line-comment-' + projectFileId).val();

    $.post(uri.lineComment.addComment,
        { changesetIdentifier: changesetIdentifier, projectFileId:projectFileId, text:text, lineNumber:lineNumber},
        function (threadGroupsWithSnippetsForCommentedFile) {
            if (threadGroupsWithSnippetsForCommentedFile.errors == null) {
                updateAccordion(threadGroupsWithSnippetsForCommentedFile, changesetIdentifier, projectFileId);
                closeLineCommentForm(changesetIdentifier, projectFileId);
            } else {
                renderLineCommentErrors(threadGroupsWithSnippetsForCommentedFile.errors, '.validationErrors')
            }
        },
        "json"
    );
}

function removeLineCommentPopover($fileListings) {
    $fileListings.each(function () {
        var commentedLine = $(this).data('$commentedLine');
        if (commentedLine) {
            commentedLine.popover('destroy');
        }
    });
}

function addReply(threadId, changesetIdentifier, projectFileId){
    var text = $('.changeset[data-identifier=' + changesetIdentifier + ']').find('.addThreadReply[data-identifier=' + threadId + ']').val();

    $.post(uri.lineComment.addReply,
        { threadId: threadId, text:text, changesetIdentifier: changesetIdentifier, projectFileId: projectFileId},
        function (threadGroupsWithSnippetsForCommentedFile) {
            if (threadGroupsWithSnippetsForCommentedFile.errors == null) {
                updateAccordion(threadGroupsWithSnippetsForCommentedFile, changesetIdentifier, projectFileId);
            }
            else {
                renderLineCommentErrors(threadGroupsWithSnippetsForCommentedFile.errors, '.validationErrors[data-identifier=' + threadId + ']')
            }
        },
        "json"
    );

}

function renderLineCommentErrors(error, placeSelector) {
    if (error.code == "maxSize.exceeded") {
        $(placeSelector)
            .html($('#errorCommentTemplate')
            .render(" Your comment is too long!"))
            .hide().fadeIn();
    }
    else if (error.code == "blank") {
        $(placeSelector)
            .html($('#errorCommentTemplate')
            .render("Comment can't be empty!"))
            .hide().fadeIn();
    }
}

function expandCommentForm($form) {
    $form.find('.buttons').slideDown(100);
    $form.find('textarea').attr('rows', 3);
}

function resetCommentForm($form) {
    $form.find('textarea').val('').attr('rows', 1);
    $form.find('.buttons').hide();
    $form.find('.longComment').remove();
}

function expandReplyForm(threadId, changesetId) {
    $('.changeset[data-identifier=' + changesetId + ']').find('.threadReplyFormButtons[data-identifier=' + threadId + ']').slideDown(100);
    $('.changeset[data-identifier=' + changesetId + ']').find('.addThreadReply[data-identifier=' + threadId + ']').attr('rows', 3);
}

function cancelReply(threadId, changesetId) {
    $('.changeset[data-identifier=' + changesetId + ']').find('.threadReplyFormButtons[data-identifier=' + threadId + ']').hide();
    $('.changeset[data-identifier=' + changesetId + ']').find('.addThreadReply[data-identifier=' + threadId + ']').attr('rows', 1);
    $('.changeset[data-identifier=' + changesetId + ']').find('.addThreadReply[data-identifier=' + threadId + ']').val("");
}
