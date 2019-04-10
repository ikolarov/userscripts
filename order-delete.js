// ==UserScript==
// @name         Orders Delete
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.myshopify.com/admin/orders
// @grant        none
// ==/UserScript==

(async function() {
    while(typeof jQuery === 'undefined' || jQuery('#orders-results').length === 0){
        await new Promise(r => setTimeout(r, 500));
    }

    if(window.location.href.indexOf('.myshopify.com/admin/orders') > -1) {
      var $orders = jQuery('#orders-results');
      if($orders.find('.empty-search-results__title').length > 0) {
        return false;
      }
      $orders.find('.ui-nested-link-container').each(function(){
      var $this = jQuery(this);
      var thisInputVal = $this.find('input[type="checkbox"]').val();
      $this.append(`<td class="delete-td"><a href="/admin/orders/${thisInputVal}.json" class="delete-order">Delete</a></td>`)
      })

      jQuery('.delete-order').on('click', function(e) {
        e.preventDefault();
        var $this = jQuery(this);
        if (confirm("This will delete the order permanently!!!")){
          var $tr = $this.closest('tr');
          $tr.css('opacity', 0.3);
          jQuery.ajax({
            url: $this.attr('href'),
            method: 'delete'
          }).done(function() {
            $tr.remove();
          })
        }
      })

      $orders.closest('.ui-layout__item').append('<a href="#" class="ui-button btn-destroy delete-all-orers">Delete 250 Orders</a>');

      jQuery('.delete-all-orers').on('click', async function() {
        var orders = [];
        if (confirm("This will delete 250 ORDERS permanently!!!")){
          await jQuery.ajax({
            url: '/admin/orders.json',
            data: 'limit=250'
          }).done(function(data) {
            orders = data.orders;
          })

          for(let i = 0; i < orders.length; i++) {
            await jQuery.ajax({
              url: `orders/${orders[i].id}.json`,
              method: 'delete'
            }).done(function() {
              jQuery(`tr[data-bind-class="{selected: selected[${orders[i].id}]}"]`).remove();
            })
          }
        }
      })
    }
})();
