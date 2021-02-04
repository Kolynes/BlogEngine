/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 97);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = normalizeComponent;
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if (item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}

/***/ }),

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(13);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(2).default
var update = add("54f2fb0a", content, false, {"url":false});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../node_modules/css-loader/index.js??ref--3-1!../node_modules/sass-loader/lib/loader.js!./app.scss", function() {
     var newContent = require("!!../node_modules/css-loader/index.js??ref--3-1!../node_modules/sass-loader/lib/loader.js!./app.scss");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 102:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),

/***/ 108:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_template_id_1e0c2bce___ = __webpack_require__(140);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_template_id_1e0c2bce___["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_template_id_1e0c2bce___["b"]; });


/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = listToStyles;
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles(parentId, list) {
  var styles = [];
  var newStyles = {};
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = item[0];
    var css = item[1];
    var media = item[2];
    var sourceMap = item[3];
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    };
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] });
    } else {
      newStyles[id].parts.push(part);
    }
  }
  return styles;
}

/***/ }),

/***/ 123:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_template_id_10bc17e8_scoped_true___ = __webpack_require__(155);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_template_id_10bc17e8_scoped_true___["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_template_id_10bc17e8_scoped_true___["b"]; });


/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, ".v-btn:not(.v-btn--icon), .v-card, .v-dialog, .v-list, .v-list__tile, .v-menu__content {\n  border-radius: 21px 8px; }\n", ""]);

// exports


/***/ }),

/***/ 137:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_style_loader_index_js_ref_3_0_node_modules_css_loader_index_js_ref_3_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_sass_loader_lib_loader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_style_index_0_id_10bc17e8_lang_scss_scoped_true___ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_style_loader_index_js_ref_3_0_node_modules_css_loader_index_js_ref_3_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_sass_loader_lib_loader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_style_index_0_id_10bc17e8_lang_scss_scoped_true____default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__node_modules_vue_style_loader_index_js_ref_3_0_node_modules_css_loader_index_js_ref_3_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_sass_loader_lib_loader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_style_index_0_id_10bc17e8_lang_scss_scoped_true___);
/* unused harmony reexport namespace */
 /* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0__node_modules_vue_style_loader_index_js_ref_3_0_node_modules_css_loader_index_js_ref_3_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_sass_loader_lib_loader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_style_index_0_id_10bc17e8_lang_scss_scoped_true____default.a); 

/***/ }),

/***/ 14:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_template_id_268cf11b___ = __webpack_require__(15);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_template_id_268cf11b___["a"]; });
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_template_id_268cf11b___["b"]; });


/***/ }),

/***/ 140:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-container",
    { attrs: { fluid: "" } },
    [
      _c(
        "v-toolbar",
        { attrs: { dark: _vm.toolbarDark, color: "primary", app: _vm.app } },
        [
          _c(
            "v-btn",
            {
              attrs: { icon: "" },
              on: {
                click: function($event) {
                  _vm.$emit("back")
                }
              }
            },
            [_c("v-icon", [_vm._v("keyboard_backspace")])],
            1
          ),
          _vm._v(" "),
          _c("span", { staticClass: "subheading" }, [
            _vm._v("Account Recovery")
          ])
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "v-stepper",
        {
          attrs: { id: "vertical-steppers", vertical: "", dark: _vm.dark },
          model: {
            value: _vm.activeStep,
            callback: function($$v) {
              _vm.activeStep = $$v
            },
            expression: "activeStep"
          }
        },
        [
          _c(
            "v-stepper-step",
            {
              attrs: { step: "1", complete: _vm.activeStep > 1 },
              on: { click: _vm.restart }
            },
            [
              _vm._v(
                "\n            " +
                  _vm._s(
                    _vm.activeStep <= 1 ? "Username" : "Click here to restart"
                  ) +
                  "\n            "
              ),
              _c("small", [
                _vm._v(
                  _vm._s(
                    _vm.activeStep <= 1 ? "Please enter your username" : ""
                  )
                )
              ])
            ]
          ),
          _vm._v(" "),
          _c(
            "v-stepper-content",
            { attrs: { step: "1" } },
            [
              _c(
                "v-form",
                {
                  ref: "sendVerificationCodeForm",
                  on: {
                    submit: function($event) {
                      $event.preventDefault()
                      _vm.sendVerificationCode()
                    }
                  }
                },
                [
                  _c(
                    "v-text-field",
                    {
                      attrs: {
                        disabled: _vm.activeStep != 1,
                        label: "Enter username",
                        rules: [_vm.$requiredRule],
                        "error-messages": _vm.usernameErrors,
                        "prepend-icon": "person_outline",
                        dark: _vm.dark,
                        light: _vm.light,
                        color: _vm.color
                      },
                      model: {
                        value: _vm.username,
                        callback: function($$v) {
                          _vm.username = $$v
                        },
                        expression: "username"
                      }
                    },
                    [
                      _vm.findingAdmin
                        ? _c("v-progress-circular", {
                            attrs: {
                              slot: "append-outer",
                              color: "primary",
                              indeterminate: "",
                              width: "1"
                            },
                            slot: "append-outer"
                          })
                        : _vm._e()
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      attrs: {
                        icon: "",
                        loading: _vm.sending,
                        type: "submit",
                        color: "primary"
                      }
                    },
                    [_c("v-icon", [_vm._v("keyboard_arrow_right")])],
                    1
                  )
                ],
                1
              )
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-stepper-step",
            { attrs: { step: "2", complete: _vm.activeStep > 2 } },
            [
              _vm._v("\n            Verify Account\n            "),
              _c("small", [_vm._v("Please enter verification code")])
            ]
          ),
          _vm._v(" "),
          _c(
            "v-stepper-content",
            { attrs: { step: "2" } },
            [
              _c(
                "v-form",
                {
                  ref: "verificationForm",
                  on: {
                    submit: function($event) {
                      $event.preventDefault()
                      return _vm.verify($event)
                    }
                  }
                },
                [
                  _c("v-text-field", {
                    attrs: {
                      disabled: _vm.activeStep != 2,
                      label: "Enter verification code",
                      rules: [_vm.$requiredRule],
                      type: "number",
                      "error-messages": _vm.verificationErrors,
                      "prepend-icon": "fiber_pin",
                      dark: _vm.dark,
                      light: _vm.light,
                      color: _vm.color
                    },
                    model: {
                      value: _vm.code,
                      callback: function($$v) {
                        _vm.code = $$v
                      },
                      expression: "code"
                    }
                  }),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      attrs: {
                        color: "primary",
                        loading: _vm.verifying,
                        disabled: _vm.activeStep != 2,
                        type: "submit"
                      }
                    },
                    [_vm._v("verify")]
                  ),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      attrs: { loading: _vm.sending },
                      on: {
                        click: function($event) {
                          _vm.sendVerificationCode("resend")
                        }
                      }
                    },
                    [_vm._v("Resend code")]
                  )
                ],
                1
              )
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-stepper-step",
            { attrs: { step: "3", complete: _vm.activeStep > 3 } },
            [
              _vm._v("\n            Reset Password\n            "),
              _c("small", [_vm._v("Create a new password")])
            ]
          ),
          _vm._v(" "),
          _c(
            "v-stepper-content",
            { attrs: { step: "3" } },
            [
              _c(
                "v-form",
                {
                  ref: "resetPasswordForm",
                  on: {
                    submit: function($event) {
                      $event.preventDefault()
                      return _vm.resetPassword($event)
                    }
                  }
                },
                [
                  _c("v-password-field", {
                    attrs: {
                      disabled: _vm.activeStep != 3,
                      label: "Enter new password",
                      rules: [_vm.$requiredRule, _vm.$requiredLengthRule(6)],
                      "error-messages": _vm.newPasswordErrors,
                      "prepend-icon": "lock_outline",
                      dark: _vm.dark,
                      light: _vm.light,
                      color: _vm.color
                    },
                    model: {
                      value: _vm.newPassword,
                      callback: function($$v) {
                        _vm.newPassword = $$v
                      },
                      expression: "newPassword"
                    }
                  }),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      attrs: {
                        icon: "",
                        color: "primary",
                        loading: _vm.verifying,
                        disabled: _vm.activeStep != 3,
                        type: "submit"
                      }
                    },
                    [_c("v-icon", [_vm._v("keyboard_arrow_right")])],
                    1
                  )
                ],
                1
              )
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-stepper-step",
            { attrs: { step: "4", complete: _vm.activeStep > 4 } },
            [_vm._v("\n            Done\n        ")]
          ),
          _vm._v(" "),
          _c(
            "v-stepper-content",
            { attrs: { step: "4" } },
            [
              _c("p", [
                _vm._v(
                  "Account recovery was completed succesfully. What would you like to do next?"
                )
              ]),
              _vm._v(" "),
              _c(
                "v-btn",
                {
                  attrs: { color: "primary", loading: _vm.signingIn },
                  on: { click: _vm.signIn }
                },
                [_vm._v("sign me in")]
              ),
              _vm._v(" "),
              _c(
                "v-btn",
                {
                  on: {
                    click: function($event) {
                      _vm.$emit("back")
                    }
                  }
                },
                [_vm._v("close")]
              )
            ],
            1
          )
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "v-snackbar",
        {
          attrs: { bottom: "", right: _vm.$vuetify.breakpoint.smAndUp },
          model: {
            value: _vm.showSnackbar,
            callback: function($$v) {
              _vm.showSnackbar = $$v
            },
            expression: "showSnackbar"
          }
        },
        [
          _c("v-icon", { attrs: { color: _vm.snackbarMessage.iconColor } }, [
            _vm._v(_vm._s(_vm.snackbarMessage.icon))
          ]),
          _vm._v(" "),
          _c("span", { staticClass: "ml-2" }, [
            _vm._v(_vm._s(_vm.snackbarMessage.message))
          ]),
          _vm._v(" "),
          _c("v-spacer"),
          _vm._v(" "),
          _c(
            "v-btn",
            {
              attrs: { icon: "" },
              on: {
                click: function($event) {
                  _vm.showSnackbar = false
                }
              }
            },
            [_c("v-icon", [_vm._v("close")])],
            1
          )
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 15:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-text-field",
    _vm._b(
      {
        attrs: {
          value: _vm.value,
          "append-icon": _vm.visibilityIcon
            ? !_vm.visibility
              ? "visibility"
              : "visibility_off"
            : null,
          type: !_vm.visibility ? "password" : "text"
        },
        on: {
          input: function($event) {
            _vm.$emit("input", $event)
          },
          "click:append": function($event) {
            _vm.visibility = !_vm.visibility
          }
        }
      },
      "v-text-field",
      _vm.$attrs,
      false
    )
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 155:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-app",
    [
      !_vm.recoverAccount
        ? _c(
            "v-content",
            [
              _c(
                "v-container",
                {
                  attrs: {
                    "justify-center": "",
                    "align-center": "",
                    "fill-height": ""
                  }
                },
                [
                  _c(
                    "v-card",
                    [
                      _c("v-card-text", [
                        _c("h1", { staticClass: "title" }, [_vm._v("UBlogger")])
                      ]),
                      _vm._v(" "),
                      _c(
                        "v-card-text",
                        [
                          _c(
                            "v-form",
                            {
                              ref: "signInForm",
                              on: {
                                submit: function($event) {
                                  $event.preventDefault()
                                  return _vm.signIn($event)
                                }
                              }
                            },
                            [
                              _c("v-text-field", {
                                attrs: {
                                  label: "Username",
                                  rules: [_vm.$requiredRule],
                                  "prepend-icon": "person_outline"
                                },
                                model: {
                                  value: _vm.username,
                                  callback: function($$v) {
                                    _vm.username = $$v
                                  },
                                  expression: "username"
                                }
                              }),
                              _vm._v(" "),
                              _c("v-password-field", {
                                attrs: {
                                  label: "Password",
                                  rules: [_vm.$requiredRule],
                                  "prepend-icon": "lock_outline"
                                },
                                model: {
                                  value: _vm.password,
                                  callback: function($$v) {
                                    _vm.password = $$v
                                  },
                                  expression: "password"
                                }
                              }),
                              _vm._v(" "),
                              _c("v-checkbox", {
                                attrs: { label: "keep me signed in" },
                                model: {
                                  value: _vm.keepSignedIn,
                                  callback: function($$v) {
                                    _vm.keepSignedIn = $$v
                                  },
                                  expression: "keepSignedIn"
                                }
                              }),
                              _vm._v(" "),
                              _c(
                                "h5",
                                { staticClass: "text--red" },
                                [
                                  _vm.error
                                    ? _c(
                                        "v-icon",
                                        {
                                          staticClass: "mr-1",
                                          attrs: { color: "red" }
                                        },
                                        [_vm._v("warning")]
                                      )
                                    : _vm._e(),
                                  _vm._v(_vm._s(_vm.error))
                                ],
                                1
                              ),
                              _vm._v(" "),
                              _c(
                                "v-btn",
                                {
                                  attrs: {
                                    small: "",
                                    type: "submit",
                                    round: "",
                                    loading: _vm.signingIn,
                                    color: "primary"
                                  }
                                },
                                [_vm._v("sign in")]
                              ),
                              _vm._v(" "),
                              _c(
                                "v-btn",
                                {
                                  attrs: {
                                    small: "",
                                    round: "",
                                    disabled: _vm.signingIn,
                                    color: "secondary"
                                  },
                                  on: {
                                    click: function($event) {
                                      _vm.recoverAccount = true
                                    }
                                  }
                                },
                                [_vm._v("forgot password")]
                              )
                            ],
                            1
                          )
                        ],
                        1
                      )
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-snackbar",
                {
                  attrs: { bottom: "", right: _vm.$vuetify.breakpoint.smAndUp },
                  model: {
                    value: _vm.showSnackbar,
                    callback: function($$v) {
                      _vm.showSnackbar = $$v
                    },
                    expression: "showSnackbar"
                  }
                },
                [
                  _c(
                    "v-icon",
                    { attrs: { color: _vm.snackbarMessage.iconColor } },
                    [_vm._v(_vm._s(_vm.snackbarMessage.icon))]
                  ),
                  _vm._v(" "),
                  _c("span", { staticClass: "ml-2" }, [
                    _vm._v(_vm._s(_vm.snackbarMessage.message))
                  ]),
                  _vm._v(" "),
                  _c("v-spacer"),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      attrs: { icon: "" },
                      on: {
                        click: function($event) {
                          _vm.showSnackbar = false
                        }
                      }
                    },
                    [_c("v-icon", [_vm._v("close")])],
                    1
                  )
                ],
                1
              )
            ],
            1
          )
        : _c("account-recovery", {
            attrs: { "toolbar-dark": "", path: "account-recovery" },
            on: {
              back: function($event) {
                _vm.recoverAccount = false
              }
            }
          })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
    props: {
        dark: Boolean,
        toolbarDark: Boolean,
        light: Boolean,
        color: String,
        app: Boolean,
        path: String
    },
    data: function data() {
        return {
            activeStep: 1,
            username: "",
            code: "",
            newPassword: "",

            sending: false,
            verifying: false,
            resetting: false,
            signingIn: false,

            usernameErrors: [],
            verificationErrors: [],
            newPasswordErrors: [],

            snackbarMessage: {},
            showSnackbar: false
        };
    },

    methods: {
        sendVerificationCode: function sendVerificationCode() {
            var _this = this;

            var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "send";

            if (this.$refs.sendVerificationCodeForm.validate()) {
                this.sending = true;
                this.usernameErrors = [];
                var form = new FormData();
                form.append("username", (this.username[0].toUpperCase() + this.username.substring(1).toLowerCase()).trim());
                form.append("mode", mode);
                this.$http.request({
                    url: this.path + "/send-verification-code/",
                    method: "POST",
                    content: form
                }).then(function (response) {
                    response = response.json();
                    if (response.status) {
                        if (mode == "send") {
                            _this.username = (_this.username[0].toUpperCase() + _this.username.substring(1).toLowerCase()).trim();
                            _this.activeStep++;
                        } else {
                            _this.snackbarMessage = { message: "Verification code resent", icon: "done", iconColor: "success" };
                            _this.showSnackbar = true;
                        }
                    } else {
                        if (mode == "resend") {
                            _this.snackbarMessage = { message: "Failed to resend verification code", icon: "done", iconColor: "red" };
                            _this.showSnackbar = true;
                        } else {
                            _this.usernameErrors.push(response.error);
                        }
                    }
                    _this.sending = false;
                }).catch(function (reason) {
                    if (reason == "The connection timed out. Please try again.") {
                        _this.snackbarMessage = { message: reason, icon: "warning", iconColor: "red" };
                    } else {
                        _this.snackbarMessage = { message: "Failed to complete the request. Please try again.", icon: "warning", iconColor: "red" };
                    }
                    _this.showSnackbar = true;
                    _this.sending = false;
                });
            }
        },
        verify: function verify() {
            var _this2 = this;

            if (this.$refs.verificationForm.validate()) {
                this.verifying = true;
                this.verificationErrors = [];
                var form = new FormData();
                form.append("username", this.username);
                form.append("code", this.code);
                this.$http.request({
                    url: this.path + "/verify/",
                    method: "POST",
                    content: form
                }).then(function (response) {
                    response = response.json();
                    if (!response.status) {
                        _this2.verificationErrors.push(response.error);
                    } else {
                        _this2.activeStep++;
                    }
                    _this2.verifying = false;
                }).catch(function (reason) {
                    console.log(reason);
                    if (reason == "The connection timed out. Please try again.") {
                        _this2.snackbarMessage = { message: reason, icon: "warning", iconColor: "red" };
                    } else {
                        _this2.snackbarMessage = { message: "Failed to complete the request. Please try again.", icon: "warning", iconColor: "red" };
                    }
                    _this2.showSnackbar = true;
                    _this2.verifying = false;
                });
            }
        },
        resetPassword: function resetPassword() {
            var _this3 = this;

            if (this.$refs.resetPasswordForm.validate()) {
                this.resetting = true;
                var form = new FormData();
                form.append("new-password", this.newPassword);
                form.append("username", this.username);
                form.append("code", this.code);
                this.$http.request({
                    url: this.path + "/reset-password/",
                    method: "POST",
                    content: form
                }).then(function (response) {
                    response = response.json();
                    _this3.activeStep++;
                    _this3.resetting = false;
                }).catch(function (reason) {
                    console.log(reason);
                    if (reason == "The connection timed out. Please try again.") {
                        _this3.snackbarMessage = { message: reason, icon: "warning", iconColor: "red" };
                    } else {
                        _this3.snackbarMessage = { message: "Failed to complete the request. Please try again.", icon: "warning", iconColor: "red" };
                    }
                    _this3.showSnackbar = true;
                    _this3.resetting = false;
                });
            }
        },
        signIn: function signIn() {
            var _this4 = this;

            this.signingIn = true;
            var form = new FormData();
            form.append("username", this.username);
            form.append("password", this.newPassword);
            form.append("keepSignedIn", true);
            this.$http.request({
                url: this.path + "/sign-in/",
                method: "POST",
                content: form
            }).then(function (response) {
                response = response.json();
                window.location = "";
            }).catch(function (reason) {
                if (reason == "The connection timed out. Please try again.") {
                    _this4.snackbarMessage = { message: reason, icon: "warning", iconColor: "red" };
                } else {
                    _this4.snackbarMessage = { message: "Failed to complete the request. Please try again.", icon: "warning", iconColor: "red" };
                }
                _this4.showSnackbar = true;
                _this4.signingIn = false;
            });
        },
        restart: function restart() {
            if (this.activeStep != 1) {
                this.activeStep = 1;
                this.usernameErrors = [];
                this.verificationErrors = [];
                this.newPasswordErrors = [];
                this.$refs.sendVerificationCodeForm.reset();
                this.$refs.verificationForm.reset();
                this.$refs.resetPasswordForm.reset();
            }
        }
    }
};

/***/ }),

/***/ 2:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["default"] = addStylesClient;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__listToStyles__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__listToStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__listToStyles__);
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = __WEBPACK_IMPORTED_MODULE_0__listToStyles___default()(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = __WEBPACK_IMPORTED_MODULE_0__listToStyles___default()(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
//
//
//
//
//
//
//
//
//
//

exports.default = {
    name: "VPasswordField",
    inheritAttrs: false,
    props: {
        value: String,
        visibilityIcon: {
            type: Boolean,
            default: true
        }
    },
    model: {
        prop: "value",
        event: "input"
    },
    data: function data() {
        return {
            visibility: false
        };
    },

    watch: {
        visibility: function visibility(newValue) {
            this.$emit("visibility", newValue);
        }
    }
};

/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

exports.default = {
    data: function data() {
        return {
            username: "",
            password: "",
            keepSignedIn: false,
            error: "",
            signingIn: false,
            recoverAccount: false,
            showSnackbar: false,
            snackbarMessage: {}
        };
    },

    methods: {
        signIn: function signIn() {
            var _this = this;

            if (this.$refs.signInForm.validate()) {
                var form = new FormData();
                form.append("username", (this.username[0].toUpperCase() + this.username.substring(1).toLowerCase()).trim());
                form.append("password", this.password);
                form.append("keepSignedIn", this.keepSignedIn);
                this.error = "";
                this.signingIn = true;
                this.$http.request({
                    url: "sign-in/",
                    method: "POST",
                    content: form
                }).then(function (response) {
                    response = response.json();
                    if (!response.status) {
                        _this.signingIn = false;
                        _this.error = response.error;
                    } else {
                        window.location.href = "";
                    }
                }).catch(function (reason) {
                    if (reason == "The connection timed out. Please try again.") {
                        _this.snackbarMessage.message = reason;
                    } else {
                        _this.snackbarMessage.message = "Failed to complete request. Please try again.";
                    }
                    _this.showSnackbar = true;
                    _this.signingIn = false;
                });
            }
        }
    }
};

/***/ }),

/***/ 4:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_script_lang_js___ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_script_lang_js____default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_script_lang_js___);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_script_lang_js___) if(["default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_script_lang_js___[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_VPasswordField_vue_vue_type_script_lang_js____default.a); 

/***/ }),

/***/ 41:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_babel_loader_lib_index_js_ref_1_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_script_lang_js___ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_babel_loader_lib_index_js_ref_1_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_script_lang_js____default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_babel_loader_lib_index_js_ref_1_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_script_lang_js___);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_babel_loader_lib_index_js_ref_1_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_script_lang_js___) if(["default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_babel_loader_lib_index_js_ref_1_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_script_lang_js___[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__BlogEngineApp_BlogEngineAppVue_node_modules_babel_loader_lib_index_js_ref_1_BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountRecovery_vue_vue_type_script_lang_js____default.a); 

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cookies = function () {
    function Cookies() {
        _classCallCheck(this, Cookies);

        this.load();
    }

    _createClass(Cookies, [{
        key: "get",
        value: function get(cookie) {
            this.load();
            return this.cookieObject[cookie];
        }
    }, {
        key: "set",
        value: function set(cookie, value) {
            this.cookieObject[cookie] = value;
            document.cookie = cookie + "=" + value;
            this.load();
        }
    }, {
        key: "load",
        value: function load() {
            this.cookieString = document.cookie;
            var temp = this.cookieString.split("; ");
            this.cookieObject = {};
            for (var i in temp) {
                i = temp[i];

                var _i$split = i.split("="),
                    _i$split2 = _slicedToArray(_i$split, 2),
                    name = _i$split2[0],
                    value = _i$split2[1];

                this.cookieObject[name] = value;
            }
        }
    }, {
        key: "clear",
        value: function clear() {}
    }]);

    return Cookies;
}();

exports.default = Cookies;

/***/ }),

/***/ 56:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_script_lang_js___ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_script_lang_js____default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_script_lang_js___);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_script_lang_js___) if(["default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_script_lang_js___[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__node_modules_babel_loader_lib_index_js_ref_1_node_modules_vue_loader_lib_index_js_vue_loader_options_SignIn_vue_vue_type_script_lang_js____default.a); 

/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Http = function () {
    function Http(global) {
        _classCallCheck(this, Http);

        this.headers = global.headers;
        this.base = global.base || "";
        if (this.base.length > 0) {
            if (this.base.lastIndexOf("/") != this.base.length - 1) {
                this.base += "/";
            }
        }
    }

    _createClass(Http, [{
        key: "createXHR",
        value: function createXHR(method, url) {
            var xhr = null;
            try {
                xhr = new XMLHttpRequest();
            } catch (e) {}
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (e) {}
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {}
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {}
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
            if (xhr) {
                xhr.open(method || "GET", "" + (this.base + url));
                xhr.xml = function () {
                    return xhr.responseXML;
                };
                xhr.json = function () {
                    return JSON.parse(xhr.responseText);
                };
                xhr.aborted = function () {
                    return reject("Request aborted");
                };
                for (var header in this.headers) {
                    xhr.setRequestHeader(header, this.headers[header].constructor == Function ? this.headers[header]() : this.headers[header]);
                }
            }
            return xhr;
        }
    }, {
        key: "request",
        value: function request(requestObject) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var xhr = _this.createXHR(requestObject.method, requestObject.url);
                for (var header in requestObject.headers) {
                    xhr.setRequestHeader(header, requestObject.headers[header].constructor == Function ? requestObject.headers[header]() : requestObject.headers[header]);
                }
                if (!requestObject.cors) {
                    xhr.setRequestHeader("cache-control", "no-cache");
                }
                xhr.timeout = requestObject.timeout || 15000;
                xhr.ontimeout = function () {
                    xhr.abort();
                    return reject("The connection timed out. Please try again.");
                };
                xhr.onerror = function (e) {
                    console.error(e);
                    return reject("An Error occured!" + e);
                };
                try {
                    xhr.send(requestObject.content);
                } catch (e) {
                    console.error(e);
                    reject("Request failed! " + e);
                }
                xhr.onload = function () {
                    return resolve(xhr);
                };
            });
        }
    }]);

    return Http;
}();

exports.default = Http;

/***/ }),

/***/ 69:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(102);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__(2).default
var update = add("fd36a476", content, false, {"url":false});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"url\":false}!../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/index.js?{}!./SignIn.vue?vue&type=style&index=0&id=10bc17e8&lang=scss&scoped=true&", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{\"url\":false}!../../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/index.js?{}!./SignIn.vue?vue&type=style&index=0&id=10bc17e8&lang=scss&scoped=true&");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -Infinity;
    var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

    var rule = function rule(value) {
        value = (value || "").toString();
        if (value.length < min) {
            return "This field should be at least " + min + " characters long.";
        } else if (value.length > max) {
            return "This field should be at most " + max + " characters long.";
        } else return true;
    };
    return rule;
};

/***/ }),

/***/ 76:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AccountRecovery_vue_vue_type_template_id_1e0c2bce___ = __webpack_require__(108);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__AccountRecovery_vue_vue_type_script_lang_js___ = __webpack_require__(41);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_1__AccountRecovery_vue_vue_type_script_lang_js___) if(["default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_1__AccountRecovery_vue_vue_type_script_lang_js___[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_runtime_componentNormalizer_js__ = __webpack_require__(0);





/* normalize component */

var component = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__BlogEngineApp_BlogEngineAppVue_node_modules_vue_loader_lib_runtime_componentNormalizer_js__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_1__AccountRecovery_vue_vue_type_script_lang_js___["default"],
  __WEBPACK_IMPORTED_MODULE_0__AccountRecovery_vue_vue_type_template_id_1e0c2bce___["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_0__AccountRecovery_vue_vue_type_template_id_1e0c2bce___["b" /* staticRenderFns */],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) {
  var api = require("/home/kolynes/Workspace/BlogEngine/BlogEngineApp/BlogEngineAppVue/node_modules/vue-hot-reload-api/dist/index.js")
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!module.hot.data) {
      api.createRecord('1e0c2bce', component.options)
    } else {
      api.reload('1e0c2bce', component.options)
    }
    module.hot.accept("./AccountRecovery.vue?vue&type=template&id=1e0c2bce&", function () {
      api.rerender('1e0c2bce', {
        render: render,
        staticRenderFns: staticRenderFns
      })
    })
  }
}
component.options.__file = "AccountRecoveryApp/AccountRecoveryAppVue/src/components/AccountRecovery.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  return (value || "").length > 0 || "This field is required";
};

/***/ }),

/***/ 87:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__SignIn_vue_vue_type_template_id_10bc17e8_scoped_true___ = __webpack_require__(123);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__SignIn_vue_vue_type_script_lang_js___ = __webpack_require__(56);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_1__SignIn_vue_vue_type_script_lang_js___) if(["default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_1__SignIn_vue_vue_type_script_lang_js___[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SignIn_vue_vue_type_style_index_0_id_10bc17e8_lang_scss_scoped_true___ = __webpack_require__(137);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__node_modules_vue_loader_lib_runtime_componentNormalizer_js__ = __webpack_require__(0);






/* normalize component */

var component = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__node_modules_vue_loader_lib_runtime_componentNormalizer_js__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_1__SignIn_vue_vue_type_script_lang_js___["default"],
  __WEBPACK_IMPORTED_MODULE_0__SignIn_vue_vue_type_template_id_10bc17e8_scoped_true___["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_0__SignIn_vue_vue_type_template_id_10bc17e8_scoped_true___["b" /* staticRenderFns */],
  false,
  null,
  "10bc17e8",
  null
  
)

/* hot reload */
if (false) {
  var api = require("/home/kolynes/Workspace/BlogEngine/BlogEngineApp/BlogEngineAppVue/node_modules/vue-hot-reload-api/dist/index.js")
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!module.hot.data) {
      api.createRecord('10bc17e8', component.options)
    } else {
      api.reload('10bc17e8', component.options)
    }
    module.hot.accept("./SignIn.vue?vue&type=template&id=10bc17e8&scoped=true&", function () {
      api.rerender('10bc17e8', {
        render: render,
        staticRenderFns: staticRenderFns
      })
    })
  }
}
component.options.__file = "src/components/sign-in/SignIn.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 9:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__VPasswordField_vue_vue_type_template_id_268cf11b___ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__VPasswordField_vue_vue_type_script_lang_js___ = __webpack_require__(4);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_1__VPasswordField_vue_vue_type_script_lang_js___) if(["default","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_1__VPasswordField_vue_vue_type_script_lang_js___[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__node_modules_vue_loader_lib_runtime_componentNormalizer_js__ = __webpack_require__(0);





/* normalize component */

var component = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__node_modules_vue_loader_lib_runtime_componentNormalizer_js__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_1__VPasswordField_vue_vue_type_script_lang_js___["default"],
  __WEBPACK_IMPORTED_MODULE_0__VPasswordField_vue_vue_type_template_id_268cf11b___["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_0__VPasswordField_vue_vue_type_template_id_268cf11b___["b" /* staticRenderFns */],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) {
  var api = require("/home/kolynes/Workspace/BlogEngine/BlogEngineApp/BlogEngineAppVue/node_modules/vue-hot-reload-api/dist/index.js")
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!module.hot.data) {
      api.createRecord('268cf11b', component.options)
    } else {
      api.reload('268cf11b', component.options)
    }
    module.hot.accept("./VPasswordField.vue?vue&type=template&id=268cf11b&", function () {
      api.rerender('268cf11b', {
        render: render,
        staticRenderFns: staticRenderFns
      })
    })
  }
}
component.options.__file = "src/vuetify-extentions/VPasswordField.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 97:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _SignIn = __webpack_require__(87);

var _SignIn2 = _interopRequireDefault(_SignIn);

var _cookies = __webpack_require__(5);

var _cookies2 = _interopRequireDefault(_cookies);

var _http = __webpack_require__(6);

var _http2 = _interopRequireDefault(_http);

var _VPasswordField = __webpack_require__(9);

var _VPasswordField2 = _interopRequireDefault(_VPasswordField);

var _requiredRule = __webpack_require__(8);

var _requiredRule2 = _interopRequireDefault(_requiredRule);

var _requiredLengthRule = __webpack_require__(7);

var _requiredLengthRule2 = _interopRequireDefault(_requiredLengthRule);

var _AccountRecovery = __webpack_require__(76);

var _AccountRecovery2 = _interopRequireDefault(_AccountRecovery);

__webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Vue.component("v-password-field", _VPasswordField2.default);
Vue.component("account-recovery", _AccountRecovery2.default);

var base = location.pathname.substring(0, location.pathname.indexOf("/admin/") + 6);
Vue.prototype.$base = base;
Vue.prototype.$cookies = new _cookies2.default();
Vue.prototype.$http = new _http2.default({
    headers: {
        "X-CSRFToken": Vue.prototype.$cookies.get("csrftoken")
    },
    base: base
});
Vue.prototype.$requiredRule = _requiredRule2.default;
Vue.prototype.$requiredLengthRule = _requiredLengthRule2.default;

var vueApp = new Vue({
    el: "#vue-app",
    render: function render(h) {
        return h(_SignIn2.default);
    }
});

// vueApp.$vuetify.theme.primary = "#003659"
// vueApp.$vuetify.theme.secondary = "#0b99a7"
// vueApp.$vuetify.theme.accent = "#37c4aa"

/***/ })

/******/ });