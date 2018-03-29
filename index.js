// ==UserScript==
// @author            lt
// @name              京东订单评价助手
// @description       京东商城商品自动评价脚本
// @match             http://club.jd.com/myJdcomments/myJdcomments.action?sort=0
// @match             https://club.jd.com/myJdcomments/myJdcomments.action?sort=0
// @include           *://club.jd.com/myJdcomments/myJdcomments.action?sort=0
// @version           1.0.0
// @eversion          6
// @connect-src       www.jd.com
// @namespace         https://greasyfork.org/users/177053
// ==/UserScript==

/* eslint-disable */
(function() {
  'use strict';

  const contentArr = [
    '商品质量很好，很满意，配送速度快啊，而且配送员态度也非常好。',
    '挺好的，非常实用。京东的物流很快哟~希望以后会更快╭(╯3╰)╮',
    '多快好省，京东给力，下次还是要选择京东商城，没错，非常满意',
    '非常好，一起买的，价格便宜，快递又快，京东商城还是非常的专业和贴心，可以显示快递的位置，随时掌握快递进度，很先进！',
    '活动期间买的很实惠，京东自营，值得信赖。',
    '便宜好用，值得推荐买买买，同事都说好用。下次继续买买买，哈哈哈…',
    '京东物流就是一个字快，昨晚10点多，11点前下的单今天早上就收到，包装得很好。',
    '京东购物使我们的生活更便捷了！京东商品丰富，无所不有，自营商品更是价格优惠，童叟无欺。快递给力，包装实在。体验足不出户购物的感觉，就在京东！购物就上京东，有京东，足够！',
    '一直上京东商城网购，东西非常不错，价格便宜，物流快，是正品',
    '质量很好，性价比高，值得购买，送货速度快！！',
    '怒赞！（此评论虽仅有两个字，可谓言简意赅，一字千金，字字扣人心弦，催人泪下，足可见评论人扎实的文字功底和信手拈来的写作技巧，再加上以感叹号收尾，点睛之笔，妙笔生花，意境深远，把评论人的感情表达得淋漓尽致，有浑然天成之感，实乃评论中之极品，祝福中之绝笔也）'
  ];

  const imageArr = [
    '//img30.360buyimg.com/n1/s760x500_jfs/t17188/258/748561545/385413/42948846/5aa663f7N3b0043d8.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t19360/90/768499013/96345/9d7e7b04/5aa538f2N4391ff9a.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t16111/77/2325069505/162434/72001fc/5aa53213N19d6e87e.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t19567/347/708170556/73539/9c38d423/5aa11321N62483954.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t16306/19/2294392305/297498/7cc81938/5aa0a8c3N3fd0abc0.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t18400/73/638909230/39411/214b185f/5a9e38f6N13172e86.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t15628/85/2177691783/110829/b1c1f19b/5a9806b5Nb1cd797c.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t17494/138/524563219/165913/bfcc179d/5a8985c8Nba2724e9.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t14767/173/2249652486/101499/54828657/5a83e75eN8bc2e2a6.jpg',
    '//img30.360buyimg.com/n1/s760x500_jfs/t18994/89/798457060/284655/24dd84f1/5aa77650N42158426.jpg'
  ];

  const INTELTVAL = 8000;

  function isElement(el) {
    return el instanceof HTMLElement || (el instanceof jQuery && el.get(0) instanceof HTMLElement);
  }

  function random(arr) {
    const index = parseInt((arr.length - 1) * Math.random(), 10);
    return arr[index];
  }

  function sleep(time) {
    return new Promise((res) => setTimeout(res, time));
  }

  function randomSleep() {
    const time = 400 + parseInt((Math.random + 1) * 100, 10);
    return new Promise((res) => setTimeout(res, time));
  }

  function createClickEvent() {
    const e = document.createEvent('MouseEvent');
    e.initEvent('click', true, true);
    return e;
  }

  function clickElement(elm) {
    if (!isElement(elm)) {
      return;
    }
    const el = elm instanceof jQuery ? elm.get(0) : elm;
    el.dispatchEvent(createClickEvent());
  }

  async function checkReviewSuccess(params) {
    let dialog = document.querySelector('.ui-dialog');

    while (!dialog) {
      await sleep(100);
      dialog = document.querySelector('.ui-dialog');
    }

    const closeButton = dialog.querySelector('a[title="关闭"]');
    const text = $(dialog).find('.ui-dialog-content .item-fore h3').text();
    const success = text.includes('成功');

    closeButton.dispatchEvent(createClickEvent());
    return success;
  }

  async function review(elm) {
    if (!(elm instanceof HTMLElement)) {
      return;
    }

    const content = random(contentArr);
    const imageUrl = random(imageArr);
    const showImage = Math.random() > 0.5;

    const $elm = $(elm);
    const elmShowBoxButton = $elm.find('a:contains("点击评价")');
    const elmBox = $elm.find('.comt-box');
    const elmFiveStar = $elm.find('a[title="五星"]');
    const elmInput = $elm.find('textarea');
    const elmSubmit = $elm.find('a:contains("发表评价")');

    const name = $elm.find('.p-name a').text();
    const isCommentBoxHidden = !elmBox.attr('style') || elmBox.attr('style').includes('display: none');

    // show comment box
    if (isCommentBoxHidden) {
      clickElement(elmShowBoxButton);
      await randomSleep();
    }

    clickElement(elmFiveStar);
    clickElement(elmInput);
    elmInput.focus().val(content);
    await randomSleep();

    if (showImage) {
      const uploadImageEl = document.querySelector('input[name="imgs1"]');
      uploadImageEl.value = imageUrl;
      await randomSleep();
    }

    clickElement(elmSubmit);
    console.log('review', { name, content, imageUrl, showImage });
    await sleep(1000);
    return checkReviewSuccess();
  }

  function main() {
    let list = document.querySelectorAll('.comt-plists .comt-plist');
    list = [].slice.call(list);
    window.$stopReview = false;

    function r() {
      const it = list.shift();

      try {
        const success = review(it);
      } catch (error) {
        console.error('review error:', error, it);
      }

      if (list.length > 0 && !window.$stopReview) {
        setTimeout(r, INTELTVAL);
      }
    };

    r();
  }

  function createButton(params) {
    const button = document.createElement('button');
    const textNode = document.createTextNode('一键评价');

    button.onclick = main;

    button.style.padding = '3px 10px';
    button.style.boxShadow = '2px 2px 5px 1px rgb(236, 236, 236)';
    button.style.color = 'rgb(50, 50, 50)';
    // button.style.backgroundColor = 'none';
    // button.style.borderRadius = '5px';

    button.appendChild(textNode);
    return button;
  }

  if (window.location.hostname === 'club.jd.com') {
    const wrapper = document.querySelector('#evalu01 ul.tab');
    const item = document.createElement('li');
    const button = createButton();

    item.appendChild(button);
    wrapper.appendChild(item);
  }
})();
