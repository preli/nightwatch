// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/jsl-render/lib/render.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refresh = refresh;
exports.JSLRender = void 0;

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function refresh() {
  if (JSLRender.lastCreatedRenderer != null) {
    JSLRender.lastCreatedRenderer.refresh();
  }
}

function isFnc(f) {
  return typeof f === "function";
}

function isComponent(node) {
  return node != null && isFnc(node.render);
}

function areEqual(a, b) {
  if (b.isEqual != null) {
    return b.isEqual(a);
  }

  return a === b; // return (a as any).__proto__ !== (b as any).__proto__;
}

function swapDomElements(obj1, obj2) {
  // save the location of obj2
  var parent2 = obj2.parentElement;
  var next2 = obj2.nextElementSibling; // special case for obj1 is the next sibling of obj2

  if (next2 === obj1) {
    // just put obj1 before obj2
    parent2.insertBefore(obj1, obj2);
  } else {
    // insert obj2 right before obj1
    obj1.parentNode.insertBefore(obj2, obj1); // now insert obj1 where obj2 was

    if (next2) {
      // if there was an element after obj2, then insert obj1 right before that
      parent2.insertBefore(obj1, next2);
    } else {
      // otherwise, just append as last child
      parent2.appendChild(obj1);
    }
  }
}

function findComponentIdx(children, component) {
  for (var i = 0; i < children.length; i++) {
    if (children[i].dom._component === component) {
      return i;
    }
  }

  return -1;
}

function findNodeIdx(children, node) {
  for (var i = 0; i < children.length; i++) {
    if (children[i].dom._component == null) {
      if (node.attr != null && children[i].dom.id === node.attr.id) {
        return i;
      }
    }
  }

  return -1;
}

function switchChildren(newIdx, oldIdx, node) {
  while (node.children.length <= newIdx) {
    // newIdx is outside of bounds of node.children
    var dummyDom = document.createElement("span");
    node.dom.appendChild(dummyDom);
    node.dom.insertBefore(dummyDom, node.dom.children[oldIdx]);
    node.children.splice(oldIdx, 0, {
      tag: "span",
      dom: dummyDom,
      children: []
    });
    oldIdx++;
  }

  if (oldIdx === newIdx) {
    return;
  }

  swapDomElements(node.dom.children[newIdx], node.dom.children[oldIdx]); // switch in node.children as well (not just in DOM)

  var tmp = node.children[oldIdx];
  node.children[oldIdx] = node.children[newIdx];
  node.children[newIdx] = tmp;
}

function areAttributesEqual(attr, v, a) {
  if (a === v) {
    return true;
  }

  if (attr === "style" && typeof v === "object" && typeof a === "string") {
    var s = "";

    for (var style in v) {
      if (v.hasOwnProperty(style) && v[style] != null) {
        s += v[s] + ";";
      }
    }

    return s === a;
  }

  return false;
}

var JSLRender =
/** @class */
function () {
  function JSLRender(container, globalRefresh) {
    this.container = container;
    this.repaintScheduled = false;

    if (globalRefresh) {
      JSLRender.lastCreatedRenderer = this;
    }
  }

  JSLRender.animate = function (vnode, animation) {
    if (Array.isArray(animation)) {
      for (var i = 0; i < animation.length; i++) {
        JSLRender.animateSingle(vnode, animation[i]);
      }
    } else {
      JSLRender.animateSingle(vnode, animation);
    }
  };

  JSLRender.animateSingle = function (vnode, animation) {
    var status = {
      current: animation.from,
      timeout: 20,
      start: 0,
      now: 0
    };

    if (vnode.attr.style == null) {
      vnode.attr.style = {};
    }

    var fnc = function () {
      var _a;

      status.now = performance.now();

      if (!status.start) {
        status.start = status.now;
      }

      addStep(animation, status);
      var done = status.now - status.start >= (_a = animation.duration, _a !== null && _a !== void 0 ? _a : JSLRender.DefaultAnimationDuration);

      if (done) {
        status.current = animation.to;
      }

      if (typeof vnode.attr.style === "string") {
        var parts = vnode.attr.style.split(";");
        vnode.attr.style = "";
        var found = false;

        for (var i = 0; i < parts; i++) {
          var entry = parts[i].split(":");

          if (entry.length === 2) {
            var key = entry[0];
            var value = entry[1];

            if (key.trim() === animation.attr) {
              found = true;
              value = status.current;
            }

            vnode.attr.style += key + ":" + value + ";";
          } else {
            vnode.attr.style += parts[i] + ";";
          }
        }

        if (!found) {
          vnode.attr.style += animation.attr + ":" + status.current;
        }
      } else {
        vnode.attr.style[animation.attr] = status.current;
      }

      vnode.dom.style[animation.attr] = status.current;

      if (!done) {
        requestAnimationFrame(fnc);
      }
    };

    if (animation.delay) {
      setTimeout(fnc, animation.delay);
    } else {
      fnc();
    }
  };

  JSLRender.prototype.render = function (node) {
    if (JSLRender.PrintRenderTime) {
      // tslint:disable-next-line: no-console
      console.time("JSL render");
    }

    this.rootNode = node || this.rootNode;

    if (this.rootNode != null) {
      this.renderVNode(this.container, this.rootNode);
    }

    if (JSLRender.PrintRenderTime) {
      // tslint:disable-next-line: no-console
      console.timeEnd("JSL render");
    }
  };

  JSLRender.prototype.refresh = function () {
    var _this = this;

    if (this.repaintScheduled) {
      return;
    }

    this.repaintScheduled = true;
    window.requestAnimationFrame(function () {
      if (!_this.repaintScheduled) {
        return;
      }

      _this.repaintScheduled = false;

      _this.render();
    });
  };

  JSLRender.prototype.renderVNode = function (container, node) {
    if (this.renderedVNode == null) {
      this.renderedVNode = this.createNode(container, node);
    } else {
      this.renderedVNode = this.updateNode(this.renderedVNode, node);
    }
  };

  JSLRender.prototype.createNode = function (container, node, replaceWith) {
    // console.log("createNode");
    var vnode;
    var isComp = isComponent(node);

    if (isComp) {
      // we have a component
      if (node.onInit) {
        // if (replaceWith == null && (node as IJSLComponent).onInit) {
        node.onInit.call(node, this);
      }

      vnode = this.cloneVNode(node.render());
    } else {
      // we have a vNode
      vnode = this.cloneVNode(node);
    }

    this.sanitize(vnode);
    var dom = vnode.dom = document.createElement(vnode.tag);

    for (var attr in vnode.attr) {
      if (vnode.attr.hasOwnProperty(attr)) {
        this.setAttribute(vnode, node, attr);
      }
    }

    if (vnode.children.length > 0) {
      for (var idx = 0; idx < vnode.children.length; idx++) {
        if (vnode.children[idx] != null) {
          vnode.children[idx] = this.createNode(dom, vnode.children[idx]);
        }
      }
    } else {
      if (vnode.raw) {
        dom.innerHTML = vnode.content || "";
      } else {
        dom.textContent = vnode.content || "";
      }
    }

    if (isComp) {
      dom._component = node;
    }

    if (replaceWith != null) {
      container.insertBefore(dom, replaceWith.nextSibling);
      container.removeChild(replaceWith);
    } else {
      container.appendChild(dom);
    }

    if (isComp && node.onCreate) {
      node.onCreate.call(node, vnode);
    }

    if (vnode.animation != null) {
      JSLRender.animate(vnode, vnode.animation);
    }

    return vnode;
  };

  JSLRender.prototype.cloneVNode = function (vnode) {
    return {
      tag: vnode.tag,
      attr: __assign({}, vnode.attr),
      children: (vnode.children || []).slice(),
      dom: vnode.dom,
      raw: vnode.raw,
      content: vnode.content,
      animation: vnode.animation
    };
  };

  JSLRender.prototype.sanitize = function (vnode) {
    if (!isComponent(vnode)) {
      vnode.children = (vnode.children || []).filter(function (c) {
        return c != null;
      });
      vnode.attr = vnode.attr || [];
    }
  };

  JSLRender.prototype.updateNode = function (renderedNode, node) {
    if (renderedNode.dom == null || renderedNode.dom.parentElement == null) {
      // does not exist anymore
      // -> was probably modified outside of jsl-render code
      // -> needs to be removed now, so return undefined
      return;
    }

    var vnode;
    var isComp = isComponent(node);
    {
      var oldComponent = renderedNode.dom._component;
      var isOldNodeAComponent = oldComponent != null;

      if (isOldNodeAComponent || isComp) {
        var recreateNode = false;

        if (!isComp || !isOldNodeAComponent) {
          recreateNode = true;
        } else {
          // we had a component in last render cycle and we still have a component
          // ... but is it the same component or do we need to recreate it
          if (!areEqual(node, oldComponent)) {
            recreateNode = true;
          }

          if (node.__proto__ === oldComponent.__proto__) {
            node.State = oldComponent.State;
          }
        }

        if (recreateNode) {
          this.callRemoveEvents(renderedNode, true);
          var parent_1 = renderedNode.dom.parentElement;
          return this.createNode(parent_1, node, renderedNode.dom);
        }
      }
    }

    if (isComp) {
      vnode = this.cloneVNode(node.render());
    } else {
      // we have a vNode
      vnode = this.cloneVNode(node);
    }

    this.sanitize(vnode);
    vnode.dom = renderedNode.dom; // if (isComp) {

    vnode.dom._component = isComp ? node : undefined; // }

    if (renderedNode.tag !== vnode.tag || renderedNode.raw !== vnode.raw) {
      // tag changed -> delete and recreate
      this.callRemoveEvents(renderedNode, true);
      var parent_2 = renderedNode.dom.parentElement;
      return this.createNode(parent_2, node, renderedNode.dom);
    }

    var attributesChanged = this.updateAttributes(renderedNode, vnode, node);
    var contentChanged = this.updateContent(renderedNode, vnode);

    if ((contentChanged || attributesChanged) && isComp && node.onUpdate) {
      node.onUpdate.call(node, vnode);
    }

    return vnode;
  }; // private refreshHandlers(renderedNode: IJSLVNode, vnode: IJSLVNode, node: IJSLVNode | IJSLComponent) {
  //     for (const attr in vnode.attr) {
  //         if (isFnc(vnode.attr[attr]) &&
  //             renderedNode.attr[attr] !== vnode.attr[attr]) {
  //             if (renderedNode.dom["_" + attr + "_"] != null) {
  //                 renderedNode.dom.removeEventListener(attr, renderedNode.dom["_" + attr + "_"]);
  //             }
  //             this.setAttribute(vnode, node, attr);
  //         }
  //     }
  // }


  JSLRender.prototype.updateContent = function (renderedNode, vnode) {
    this.tryToReorderChildren(renderedNode, vnode);

    if (renderedNode.children.length !== vnode.children.length || renderedNode.content !== vnode.content) {
      if (renderedNode.children.length > 0) {
        this.callRemoveEvents(renderedNode);
      }

      if (vnode.children.length > 0) {
        vnode.dom.innerHTML = "";

        for (var idx = 0; idx < vnode.children.length; idx++) {
          vnode.children[idx] = this.createNode(vnode.dom, vnode.children[idx]);
        }
      } else {
        if (vnode.raw) {
          vnode.dom.innerHTML = vnode.content || "";
        } else {
          vnode.dom.textContent = vnode.content || "";
        }
      }

      return true;
    } else {
      var newChildren = [];

      for (var idx = 0; idx < renderedNode.children.length; idx++) {
        var tmp = this.updateNode(renderedNode.children[idx], vnode.children[idx]);

        if (tmp != null) {
          newChildren.push(tmp);
        }
      }

      vnode.children = newChildren;
      return false;
    }
  };

  JSLRender.prototype.tryToReorderChildren = function (renderedNode, vnode) {
    var _a, _b;

    if (renderedNode.children.length > 1 && vnode.children.length > 1 && vnode.children.length <= JSLRender.MaxReorderChildren) {
      var idx = void 0;
      var l = void 0;
      var anyMatchesFound = false;

      for (idx = 0, l = vnode.children.length; idx < l; idx++) {
        var c = vnode.children[idx];

        if (isComponent(c)) {
          var oldCompIdx = idx;

          if (((_b = (_a = renderedNode.children[oldCompIdx]) === null || _a === void 0 ? void 0 : _a.dom) === null || _b === void 0 ? void 0 : _b._component) !== c) {
            oldCompIdx = findComponentIdx(renderedNode.children, c);
          }

          if (oldCompIdx >= 0) {
            // found
            if (oldCompIdx !== idx) {
              switchChildren(idx, oldCompIdx, renderedNode);
            }

            anyMatchesFound = true;
          }
        } else {
          if (c != null && c.attr != null && c.attr.id != null) {
            var oldNodeIdx = idx;

            if (renderedNode.attr != null && renderedNode.attr.id !== c.attr.id) {
              oldNodeIdx = findNodeIdx(renderedNode.children, c);
            }

            if (oldNodeIdx >= 0) {
              if (oldNodeIdx !== idx) {
                switchChildren(idx, oldNodeIdx, renderedNode);
              }

              anyMatchesFound = true;
            }
          }
        }
      }

      if (anyMatchesFound) {
        if (l < renderedNode.children.length) {
          // dispose everything that is "left" and shorten renderedNode.children array to size l
          for (var i = l; i < renderedNode.children.length; i++) {
            this.callRemoveEvents(renderedNode.children[i], true);
            var dom = renderedNode.children[i].dom;

            if (dom != null && dom.parentElement != null) {
              dom.parentElement.removeChild(dom);
            }
          }

          renderedNode.children.length = l;
        } else if (l > renderedNode.children.length) {
          // add dummy nodes to make renderedNode same size
          for (var i = renderedNode.children.length; i < l; i++) {
            var dummyDom = document.createElement("span");
            renderedNode.children.push({
              tag: "span",
              dom: dummyDom,
              children: []
            });
            renderedNode.dom.appendChild(dummyDom);
          }
        }
      }
    }
  };

  JSLRender.prototype.callRemoveEvents = function (vnode, includeOwnTag) {
    for (var idx = 0; idx < vnode.children.length; idx++) {
      var cnode = vnode.children[idx];

      if (cnode && cnode.dom) {
        execute(cnode);
        this.callRemoveEvents(cnode);
      }
    }

    if (includeOwnTag && vnode.dom) {
      execute(vnode);
    }

    function execute(node) {
      var component = node.dom._component;

      if (component && component.onRemove) {
        component.onRemove.call(component, {
          container: node.dom.parentElement,
          dom: node.dom,
          node: node
        });
      }
    }
  };

  JSLRender.prototype.updateAttributes = function (rendered, vnode, node) {
    var result = false;

    for (var attribute in vnode.attr) {
      if (vnode.attr.hasOwnProperty(attribute) && !areAttributesEqual(attribute, vnode.attr[attribute], rendered.attr[attribute])) {
        if (isFnc(rendered.attr[attribute])) {
          if (rendered.dom["_" + attribute + "_"] != null) {
            rendered.dom.removeEventListener(attribute, rendered.dom["_" + attribute + "_"]);
          }
        } else {
          result = true;
        }

        this.setAttribute(vnode, node, attribute);
      }
    } // check for attributes present in rendered but not in vnode (new node)


    for (var attribute in rendered.attr) {
      if (rendered.attr.hasOwnProperty(attribute) && !vnode.attr.hasOwnProperty(attribute)) {
        if (isFnc(rendered.attr[attribute])) {
          if (rendered.dom["_" + attribute + "_"] != null) {
            rendered.dom.removeEventListener(attribute, rendered.dom["_" + attribute + "_"]);
          }
        } else {
          rendered.dom.removeAttribute(attribute);
          result = true;
        }
      }
    }

    return result;
  };

  JSLRender.prototype.setAttribute = function (vnode, node, attr) {
    var _this = this;

    if (isFnc(vnode.attr[attr])) {
      var eventHandler_1 = function (args) {
        var closestComponent = args.currentTarget;
        var component; // tslint:disable-next-line: no-conditional-assignment

        while (!(component = closestComponent._component)) {
          closestComponent = closestComponent.parentElement;

          if (closestComponent == null) {
            break;
          }
        }

        var fnc = vnode.attr[attr];

        if (fnc != null) {
          if (fnc.call(component || node, args, vnode) !== false) {
            _this.refresh();
          }
        } else {
          // this should probably not happen anyway
          vnode.dom.removeEventListener(attr, eventHandler_1);
        }
      };

      vnode.dom.addEventListener(attr, eventHandler_1);
      vnode.dom["_" + attr + "_"] = eventHandler_1;
    } else {
      var value = vnode.attr[attr];

      if (attr === "style" && typeof value === "object") {
        var s = "";

        for (var style in value) {
          if (value.hasOwnProperty(style) && value[style] != null) {
            s += style + ":" + value[style] + ";";
          }
        }

        value = s;
      }

      if (value != null) {
        vnode.dom.setAttribute(attr, value);
      } else {
        vnode.dom.removeAttribute(attr);
      }
    }
  };

  JSLRender.MaxReorderChildren = 500;
  JSLRender.DefaultAnimationDuration = 500;
  JSLRender.lastCreatedRenderer = null;
  JSLRender.PrintRenderTime = true;
  return JSLRender;
}();

exports.JSLRender = JSLRender;

function addStep(animation, status) {
  var _a, _b;

  var easingFnc = easingFunctions[(_a = animation.easing, _a !== null && _a !== void 0 ? _a : "linear")];

  if (easingFnc == null) {
    throw new Error("easing function " + animation.easing + " does not exist");
  }

  var duration = (_b = animation.duration, _b !== null && _b !== void 0 ? _b : JSLRender.DefaultAnimationDuration);

  if (typeof status.current === "number") {
    status.current = easingFnc(status.now - status.start, animation.from, animation.to - animation.from, duration);
  }

  var value = parseFloat(status.current);

  if (status.current.toString().indexOf(value.toString()) === 0) {
    value = easingFnc(status.now - status.start, parseFloat(animation.from), parseFloat(animation.to) - parseFloat(animation.from), duration);
    status.current = value + status.current.toString().replace(/[0-9.-]/g, "");
  }

  if (status.current && status.current[0] === "#") {
    // color
    var rval = parseInt(animation.from.substr(1, 2), 16);
    var gval = parseInt(animation.from.substr(3, 2), 16);
    var bval = parseInt(animation.from.substr(5, 2), 16);
    var rval2 = parseInt(animation.to.substr(1, 2), 16);
    var gval2 = parseInt(animation.to.substr(3, 2), 16);
    var bval2 = parseInt(animation.to.substr(5, 2), 16);
    var rval3 = easingFnc(status.now - status.start, rval, rval2 - rval, duration);
    var gval3 = easingFnc(status.now - status.start, gval, gval2 - gval, duration);
    var bval3 = easingFnc(status.now - status.start, bval, bval2 - bval, duration);
    status.current = "#" + padLeft(Math.round(rval3).toString(16), "0", 2) + padLeft(Math.round(gval3).toString(16), "0", 2) + padLeft(Math.round(bval3).toString(16), "0", 2);
  } // TODO: not supported -> for example color in other format than '#xxxxxx' or anything that does not start with a number

}

function padLeft(str, padStr, minLength) {
  var result = str;

  while (result.length < minLength) {
    result = padStr + result;
  }

  return result;
} // t: current time, b: begInnIng value, c: change In value, d: duration

/* BSD Licensed - taken from https://github.com/danro/jquery-easing/blob/master/jquery.easing.js */


var easingFunctions = {
  linear: function (t, b, c, d) {
    return c / d * t + b; // correct?
  },
  easeInQuad: function (t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  easeOutQuad: function (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  easeInOutQuad: function (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * (--t * (t - 2) - 1) + b;
  },
  easeInCubic: function (t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  easeOutCubic: function (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  easeInOutCubic: function (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
  },
  easeInQuart: function (t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  },
  easeOutQuart: function (t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeInOutQuart: function (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  },
  // easeInQuint(t, b, c, d) {
  //     return c * (t /= d) * t * t * t * t + b;
  // },
  // easeOutQuint(t, b, c, d) {
  //     return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  // },
  // easeInOutQuint(t, b, c, d) {
  //     if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
  //     return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  // },
  easeInSine: function (t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  },
  easeOutSine: function (t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  },
  easeInOutSine: function (t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  },
  easeInExpo: function (t, b, c, d) {
    return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },
  easeOutExpo: function (t, b, c, d) {
    return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  },
  easeInOutExpo: function (t, b, c, d) {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  // easeInCirc(t, b, c, d) {
  //     return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  // },
  // easeOutCirc(t, b, c, d) {
  //     return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  // },
  // easeInOutCirc(t, b, c, d) {
  //     if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
  //     return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  // },
  easeInElastic: function (t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;

    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);

    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  },
  easeOutElastic: function (t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * .3;

    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);

    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
  },
  easeInOutElastic: function (t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d / 2) == 2) return b + c;
    if (!p) p = d * (.3 * 1.5);

    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = p / (2 * Math.PI) * Math.asin(c / a);

    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
  },
  // easeInBack: function (t, b, c, d, s) {
  //     if (s == undefined) s = 1.70158;
  //     return c * (t /= d) * t * ((s + 1) * t - s) + b;
  // },
  // easeOutBack: function (t, b, c, d, s) {
  //     if (s == undefined) s = 1.70158;
  //     return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  // },
  // easeInOutBack: function (t, b, c, d, s) {
  //     if (s == undefined) s = 1.70158;
  //     if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
  //     return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
  // },
  easeInBounce: function (t, b, c, d) {
    return c - easingFunctions.easeOutBounce(d - t, 0, c, d) + b;
  },
  easeOutBounce: function (t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
    }
  },
  easeInOutBounce: function (t, b, c, d) {
    if (t < d / 2) return easingFunctions.easeInBounce(t * 2, 0, c, d) * .5 + b;
    return easingFunctions.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
  }
};
},{}],"node_modules/jsl-render/lib/hyperscript.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.React = void 0;

function h(componentOrTag, attr) {
  var children = [];

  for (var _i = 2; _i < arguments.length; _i++) {
    children[_i - 2] = arguments[_i];
  }

  if (componentOrTag.render != null) {
    return componentOrTag;
  }

  var result = {
    tag: componentOrTag,
    attr: attr
  };

  if (children.length > 0) {
    if (children.length === 1 && typeof children[0] === "string") {
      result.content = children[0];
    } else {
      result.children = [];

      for (var _a = 0, children_1 = children; _a < children_1.length; _a++) {
        var child = children_1[_a];

        if (Array.isArray(child)) {
          child.map(function (c) {
            return result.children.push(c);
          });
        } else if (child != null && child.tag === undefined && child.render === undefined) {
          // TODO: this is not what React does -> needs to change in future version
          result.children.push({
            tag: "span",
            content: child.toString()
          });
        } else {
          result.children.push(child);
        }
      }
    }
  }

  if (result.attr && result.attr.animation) {
    result.animation = result.attr.animation;
  }

  return result;
}

var React = {
  createElement: h
};
exports.React = React;
window.React = React;
},{}],"node_modules/jsl-render/lib/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "JSLRender", {
  enumerable: true,
  get: function () {
    return _render.JSLRender;
  }
});
Object.defineProperty(exports, "refresh", {
  enumerable: true,
  get: function () {
    return _render.refresh;
  }
});
Object.defineProperty(exports, "h", {
  enumerable: true,
  get: function () {
    return _hyperscript.h;
  }
});
Object.defineProperty(exports, "React", {
  enumerable: true,
  get: function () {
    return _hyperscript.React;
  }
});

var _render = require("./render");

var _hyperscript = require("./hyperscript");
},{"./render":"node_modules/jsl-render/lib/render.js","./hyperscript":"node_modules/jsl-render/lib/hyperscript.js"}],"index.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var jsl_render_1 = require("jsl-render");

new jsl_render_1.JSLRender(document.body, true).render(React.createElement("h1", null, "Hello World"));
},{"jsl-render":"node_modules/jsl-render/lib/index.js"}],"../../../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64061" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.tsx"], null)
//# sourceMappingURL=/Src.f69400ca.js.map