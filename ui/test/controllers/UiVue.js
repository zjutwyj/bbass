/**
 * @description 模块功能说明
 * @class UiVue
 * @author yongjin<zjut_wyj@163.com> 2016/2/6
 */
define('UiVue', ['Vue'], function(require, exports, module) {
  var UiVue, Vue, template;

  Vue = require('Vue');

  template = `<input v-model="newTodo" v-on:keyup.enter="addTodo">
  <ul>
    <li v-for="todo in todos">
      <span>{{ todo.text }}</span>
      <button v-on:click="removeTodo($index)">X</button>
    </li>
  </ul>`;

  var VueRender = Vue.extend({

    template: template,

    methods: {
      addTodo: function() {
        var text = this.newTodo.trim()
        if (text) {
          this.todos.push({ text: text })
          this.newTodo = ''
        }
      },
      removeTodo: function(index) {
        this.todos.splice(index, 1)
      }
    }
  });


  UiVue = BaseView.extend({
    initialize: function() {
      this._super({
        template: `<div class="theme-black"> <div id="app"> </div> </div>`
      });
    },
    afterRender: function() {
      new VueRender({
        data: {
          newTodo: '',
          todos: [
            { text: 'Add some todos' }
          ]
        }
      }).$mount(this.$('#app').get(0));
    }
  });

  module.exports = UiVue;
});
