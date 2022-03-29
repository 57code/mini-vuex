import { reactive, computed } from "vue";

export function createStore(options) {
  const store = {
    _state: reactive(options.state()),
    _mutations: options.mutations || {},
    _actions: options.actions || {},
  };
  function commit(type, payload) {
    // 获取type对应的mutation
    const entry = this._mutations[type];
    if (!entry) {
      console.error(`unknown mutation type: ${type}`);
      return;
    }
    // 指定上下⽂为Store实例
    // 传递state给mutation
    entry(this.state, payload);
  }
  function dispatch(type, payload) {
    // 获取⽤户编写的type对应的action
    const entry = this._actions[type];
    if (!entry) {
      console.error(`unknown action type: ${type}`);
      return;
    }
    // 异步结果处理常常需要返回Promise
    return entry(this, payload);
  }

  store.commit = commit.bind(store);
  store.dispatch = dispatch.bind(store);
  // const store = {
  //   get state() {
  //     return state
  //   },
  //   set state(val) {
  //     console.error('please use replaceState()');
  //   }
  // };
  Object.defineProperty(store, "state", {
    get() {
      return this._state;
    },
    set() {
      console.error("please use replaceState()");
    },
  });

  store.getters = {};
  const getters = options.getters;

  // 遍历options.getters, 定义store.getters
  Object.keys(getters).forEach((key) => {
    // 定义计算属性
    const result = computed(() => {
      const getter = getters[key];
      if (getter) {
        return getter.call(store, store.state);
      } else {
        console.error("unknown getters type: " + key);
        return "";
      }
    });
    Object.defineProperty(store.getters, key, {
      get() {
        // 返回计算属性即可
        return result;
      },
    });
  });

  store.install = function (app) {
    // 注册$store
    const store = this;
    // 注册$router
    app.config.globalProperties.$store = store;
  };
  return store;
}
