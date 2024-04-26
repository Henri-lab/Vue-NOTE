// 定义虚拟DOM
// (class,interface,type)?
interface vnode {
  tagName: string | Function | componentWithState;
  props?: object;
  children?: Array<vnode> | string;
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 创建一个vdom实例<div class='box'><p class='item'>i am a vnode obj</p><p class='item'>i am a vnode obj as well</p></div>
const vnode1 = {
  tagName: 'div',
  props: {
    class: 'list',
    onClick: () => {
      alert('my table clicked');
    },
  },
  children: [
    {
      tagName: 'p',
      props: {
        class: 'item',
        onClick: () => {
          alert('my p1 clicked');
        },
      },
      children: 'i am a vnode obj',
    },
    {
      tagName: 'p',
      props: {
        class: 'item',
        onClick: () => {
          alert('my p2 clicked');
        },
      },
      children: 'i am a vnode obj as well',
    },
  ],
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// vnode-renderer:vnode--->real DOM
// @container：the real domObj you want to mount your 'vdom->real DOM'
function mountElement(vnode: vnode, container: HTMLElement): void {
  if (vnode.tagName === 'string') {
    // 创建元素
    const el = document.createElement(vnode.tagName);
    // 绑定事件
    for (const key in vnode.props) {
      if (/^on/.test(key)) {
        el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key]);
      }
    }
    // 子元素
    if (typeof vnode.children === 'string') {
      // el.innerText = vnode.children;--->note
      el.appendChild(document.createTextNode(vnode.children));
    } else if (Array.isArray(vnode.children)) {
      //like backtracking algorithm，but return the real dom as a stop condition；
      vnode.children.forEach((child) => mountElement(child, el));
    }
    container.appendChild(el);
  }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//vcomponent_renderer：cope with component,abstarct of combinations of vnodes
const head: vnode = {
  tagName: 'div',
  props: {
    class: 'head',
  },
  children: 'cmp-head',
};
const main: vnode = {
  tagName: 'div',
  props: {
    class: 'main',
  },
  children: 'cmp-main',
};
const foot: vnode = {
  tagName: 'div',
  props: {
    class: 'foot',
  },
  children: 'cmp-foot',
};

// this's why react/vue的必须根元素唯一了>.<
// --omit 给component传递参数的功能~
function vcomponent(): vnode {
  // 只能return一个vnodeObj
  return {
    tagName: 'div',
    props: {
      class: 'box',
    },
    children: [head, main, foot],
  };
}
const vnode2: vnode = {
  tagName: vcomponent as () => vnode,
};

interface componentWithState {
  render: Function;
}
const vcomponentObj: componentWithState = {
  render() {
    return {
      tagName: 'div',
      props: {
        class: 'box',
      },
      children: [head, main, foot],
    };
  },
};
const vnode3: vnode = {
  tagName: vcomponentObj as componentWithState,
};

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function mountComponent(vnode: vnode, container: HTMLElement) {
  if (typeof vnode.tagName === 'function') {
    const subtree = vnode.tagName();
    renderer(subtree, container);
  } else if (vnode.tagName as componentWithState) {
    const subtree = vnode.tagName.render(); //ts 类型检查问题
    renderer(subtree, container);
  }
}

// render函数h：template--->vdomObj
// renderer:vdom-->real dom
function renderer(vnode: vnode, container: HTMLElement) {
  mountComponent(vnode, container);
  mountElement(vnode, container);
}
