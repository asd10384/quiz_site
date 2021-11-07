function joinroom(doc = new Document, private = false) {
  let roomid = doc.children.item(1).innerHTML;
  let member = doc.children.item(5).innerHTML.split('/');
  let roompw = undefined;
  if (member[0] < member[1]) {
    if (private) {
      roompw = prompt('비밀번호를 입력해주세요.');
    }
    var $form = $('<form></form>');
    $form.attr('action', '/musicquiz');
    $form.attr('method', 'post');
    var a1 = $(`<input type="hidden" name="roomid" value="${roomid}"/>`);
    var a2 = $(`<input type="hidden" name="roompw" value="${roompw}"/>`);
    $form.append(a1).append(a2);
    $form.appendTo('body');
    $form.submit();
  } else {
    alert('방이 꽉 찼습니다.');
  }
}