function isMobile() {
  let UserAgent = navigator.userAgent;
  if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
    return true;
  } else {
    return false;
  }
}

function popupopen(text) {
  $(`.popup .${text}`).css('visibility', 'visible');
  $(`.popup .${text}`).css('opacity', '1');
  if (isMobile()) {
    $(`.popup .${text}`).css('width', '40vh');
    $(`.popup .${text}`).css('height', '31vh');
    $(`.popup .${text} form p`).css('margin', '1.35vh 0 0 5.5vh');
    $(`.popup .${text} form input`).css('width', '15vh');
    $(`.popup .${text} form input[type=checkbox]`).css('width', '3vh');
    $(`.popup .${text} form select`).css('font-size', '1.5vh');
    $(`.popup .${text} form select`).css('width', '15vh');
  }
}

function popupclose(text) {
  $(`.popup .${text}`).css('visibility', 'hidden');
  $(`.popup .${text}`).css('opacity', '0');
  reset(text);
}

function reset(text) {
  $(`.popup .${text} input[name=name]`).val('');
  $(`.popup .${text} select[name=type] option:eq(0)`).prop('selected', true);
  $(`.popup .${text} input[type=number]`).val(4);
  $(`.popup .${text} input[name=pv]`).removeAttr( "checked");
  $(`.popup .${text} input[name=pw]`).val('');
}

$(function() {
  $('input[name=name]').keyup(() => {
    var $input = $('input[name=name]');
    if ($input.val().length > 15) $input.val($input.val().slice(0, 15));
  });
  $('input[name=pw]').keyup(() => {
    var $input = $('input[name=pw]');
    if ($input.val().length > 8) $input.val($input.val().slice(0, 8));
  });
  $('input[type=number]').keyup(() => {
    var $input = $('input[type=number]');
    if ($input.val()) {
      if ($input.val() < 1) $input.val(1);
      if ($input.val() > 10) $input.val(10);
    }
  });
  $('input[name=pv]:checkbox').click(() => {
    if ($('input[name=pv]:checkbox').is(':checked')) {
      $('#ppw').css('visibility', 'visible');
      $('#ipw').css('visibility', 'visible');
    } else {
      $('#ppw').css('visibility', 'hidden');
      $('#ipw').css('visibility', 'hidden');
    }
  });
});