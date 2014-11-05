// lazy create dialogs and cache them in a map for re-opening later
var dialogs = {};
jQuery(document).ready(function ($) {
  $('.player').click(function () {
    var dialogId = $(this).attr('id');
    var existingDialog = dialogs[dialogId];
    if (existingDialog) {
      existingDialog.dialog('open');
    } else {
      dialogs[dialogId] = $(this).find('.stats-dialog').dialog({
        height: 350,
        width: 704,
        closeOnEscape: true,
        show: { effect: "fade", duration: 200 },
        hide: { effect: "fade", duration: 200 },
        title: $(this).find('.player__name').clone()
      });
    }
  })
});