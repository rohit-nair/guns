window.sq || (window.sq = {}),
$(document).ready(function() {
    window.sq.home = function(e) {
        "use strict";
        function t() {
            return this instanceof t ? (r = this,
            r.currentID = -1,
            r.isTransitioning = !0,
            r.loadedBackgrounds = [],
            r.delta = 0,
            r.tweenTime = .7,
            r.tweenEase = Power3.easeInOut,
            r.elems = {},
            r.elems.timerCircle = $(".progress-circle"),
            r.elems.preloadCircle = $(".preload-circle"),
            r.elems.mainGridHolder = $(".js-home-grid-holder"),
            r.elems.storyHolder = $(".js-story-container"),
            r.elems.homeContainer = $(".js-home-container"),
            r.elems.homePanel = $(".js-home-menu"),
            r.elems.panelContent = $(".js-home-menu-content"),
            r.elems.gridHolder = $(".js-grid-container"),
            r.elems.storyCloseButton = $(".js-close-story"),
            r.elems.introHolder,
            r.elems.storyTitleHolder,
            r.elems.storyTitle,
            r.waitForLoad = !1,
            $(e).resize(n),
            void r.init()) : new t
        }
        var r;
        t.prototype = {
            init: function() {
                $("body, html, .js-page-holder").css({
                    height: "100%",
                    overflow: "hidden"
                });
                var e, t = [{
                    id: "bg_intro",
                    src: landingImage
                }];
                if (r.startImageLoader(),
                viewport().width > 1024) {
                    var e = companiesData.length - 1;
                    t.push({
                        id: 0,
                        src: companiesData[0].image_url
                    }),
                    t.push({
                        id: e,
                        src: companiesData[e].image_url
                    })
                } else
                    r.skipPreloading = !0;
                var i = new createjs.LoadQueue;
                i.on("fileload", a, this),
                i.on("fileprogress", s, this),
                i.loadManifest(t),
                r.loadQueue = i,
                $(".js-footer-leaf a").click(function(e) {
                    e.preventDefault(),
                    r.closeStory()
                }),
                n()
            },
            callReszie: function() {
                n()
            },
            startImageLoader: function() {
                r.imgLoader = new ImageLoader({
                    elements: ".js-lazy-image",
                    property: "data-img-src"
                }).on("data", function(e) {
                    return -1 !== $(e).css("display").indexOf("block") ? !0 : !1
                }).on("load", function() {}).on("error", function(e) {
                    $(e).parent().parent().css("display", "none")
                }).on("done", function() {})
            },
            startHome: function(e) {
                if (r.deeplinkID = sq.main.homeDeeplink,
                r.newMenuHTML = r.elems.panelContent.html(),
                r.deeplinkID) {
                    r.deeplinkID = r.deeplinkID.split("/")[0],
                    sq.main.homeDeeplink = !1;
                    var t = crucibleSlugs.indexOf(r.deeplinkID);
                    r.isPastIntro = !0,
                    r.createSlide(t, 0)
                } else {
                    var i = '<div class="intro _container js-intro-content"><div class="intro _copy js-intro-copy"><div class="intro _mark"><img src="/img/mark-intro.svg"></div><div class="intro _headline">' + regionData.homepage_headline + '</div><div class="intro -body-copy-medium -black -medium">' + regionData.homepage_subheadline + '</div><div class="intro _arrow"><img class="inject-svg" src="/img/intro-down-arrow.svg"></div></div></div>';
                    r.elems.mainGridHolder.append('<div class="js-home-new-grid-holder-intro _bg-holder -bg-animate" style="position:absolute;top:0px;width:100%;height:100%;">' + i + "</div>"),
                    r.elems.introHolder = $(".js-home-new-grid-holder-intro"),
                    r.elems.introContent = $(".js-intro-content"),
                    r.elems.introHolder.append(e),
                    SVGInjector(document.querySelectorAll("img.inject-svg")),
                    r.elems.introHolder.css({
                        opacity: 0,
                        cursor: "pointer"
                    }),
                    r.elems.introHolder.click(function() {
                        r.nextItem(!0, !1)
                    }),
                    r.currentBackground = r.elems.introHolder,
                    r.currentIntro = $($(".js-menu-item")[0])
                }
                $(".js-nav-container, .js-main-logo").removeClass("-invisible"),
                $(".js-nav-right, .js-main-logo").css({
                    opacity: 0
                }),
                TweenLite.to($(".js-nav-right, .js-main-logo"), .8, {
                    alpha: 1,
                    ease: "easeOutSine"
                }),
                TweenLite.delayedCall(.8, function() {
                    r.initButtons(),
                    r.isTransitioning = !1,
                    r.deeplinkID ? (r.handleOpenStory(r.deeplinkID),
                    r.deeplinkID = !1) : (r.initScrollJack(),
                    setTimeout(function() {
                        r.killScrollJack(),
                        r.initScrollJack()
                    }, 1e3))
                }),
                r.elems.introHolder && (TweenLite.to(r.elems.introHolder, .9, {
                    delay: .2,
                    alpha: 1,
                    ease: "easeOutSine"
                }),
                setTimeout(function() {
                    r.introCopyHeight = $(".js-intro-copy").height(),
                    TweenLite.to(r.elems.introContent, .9, {
                        alpha: 1,
                        ease: "easeOutSine"
                    }),
                    n()
                }, 600)),
                setTimeout(n, 0)
            },
            initButtons: function() {
                $(".js-story-link").click(function() {
                    r.clickStory()
                })
            },
            clickStory: function() {
                var e;
                r.isStoryOpen || (e = crucibleSlugs[r.currentID],
                e && r.openStory(e))
            },
            openStory: function(e) {
                var t;
                t = e,
                r.currentStoryID = e,
                trackItem("Home", "Home Navigation", "Open Story Click", e),
                History.pushState({}, "Sequoia", crucibleURL + t)
            },
            handleOpenStory: function(e) {
                var t, i;
                t = e,
                t && (i = crucibleURL + t + "/partial.html"),
                r.isStoryOpen = !0,
                r.isStoryOpening = !0;
                var s = crucibleSlugs.indexOf(t);
                r.nextItem(!0, !0, s + 1),
                $(".js-story-title").text(companiesData[r.currentID].headline),
                $(".js-story-subhead").text(companiesData[r.currentID].subheadline),
                document.title = "Sequoia - " + companiesData[r.currentID].headline,
                $("meta[property='og:description']").attr("content", companiesData[r.currentID].subheadline),
                $("meta[property='og:title']").attr("content", "Sequoia - " + companiesData[r.currentID].headline),
                $("meta[property='og:image']").attr("content", hostName + companiesData[r.currentID].image_url_small),
                null == companiesData[r.currentID].meta_description ? $("meta[name=description]").attr("content", companiesData[r.currentID].subheadline) : $("meta[name=description]").attr("content", companiesData[r.currentID].meta_description),
                r.deeplinkID ? r.initHish() : ($(".js-story-content").remove(),
                $(".js-story-container").load(i, function() {
                    r.initHish(),
                    initScrollReveal()
                })),
                setTimeout(function() {
                    r.killScrollJack()
                }, 0),
                r.killTimer(),
                r.elems.storyHolder.show(),
                $("body, html, .js-page-holder").css({
                    overflow: "auto",
                    height: "auto"
                });
                var a = .57 * r.elems.homeContainer.height();
                0 == a ? (r.androidInternetHack = !0,
                a = 200) : a = "50vh",
                TweenLite.to(r.elems.homeContainer, r.tweenTime, {
                    height: a,
                    ease: r.tweenEase,
                    onComplete: function() {
                        r.isStoryOpening = !1,
                        initScrollReveal(),
                        r.hScroll = new headerScroll($("body"),$(".js-nav-container")),
                        n("story"),
                        r.elems.storyCloseButton.show(),
                        TweenLite.to(r.elems.storyCloseButton, .5, {
                            delay: 0,
                            autoAlpha: 1,
                            ease: r.tweenEase
                        }),
                        TweenLite.to($(".js-story-title-holder"), .5, {
                            delay: .1,
                            autoAlpha: 1,
                            ease: r.tweenEase
                        })
                    }
                }),
                TweenLite.to(r.elems.homePanel, r.tweenTime, {
                    autoAlpha: 0,
                    ease: r.tweenEase
                }),
                $(".js-home-overlay").css("background-color", $(".js-home-menu").css("background-color")),
                $(".js-home-overlay, .js-story-header").css("display", "inherit"),
                TweenLite.to($(".js-story-header"), r.tweenTime, {
                    autoAlpha: 1,
                    delay: .2,
                    ease: r.tweenEase
                }),
                TweenLite.to($(".js-home-overlay"), r.tweenTime, {
                    autoAlpha: 1,
                    delay: .2,
                    ease: r.tweenEase
                }),
                n("story")
            },
            initHish: function() {
                china || $("#js-story-hish").hish()
            },
            closeStory: function() {
                trackItem("Home", "Home Navigation", "Close Story Click", r.currentStoryID),
                History.pushState({}, "Sequoia", "/")
            },
            handleCloseStory: function() {
                if (r.isStoryOpen) {
                    r.hScroll.destroy(),
                    r.isStoryOpen = !1,
                    n("closeStory"),
                    r.elems.storyCloseButton.unbind("click"),
                    r.elems.timerCircle[0].style.strokeDashoffset = 0,
                    TweenLite.to(r.elems.storyCloseButton, r.tweenTime, {
                        autoAlpha: 0,
                        ease: r.tweenEase
                    }),
                    TweenLite.to($(".js-story-title-holder"), r.tweenTime, {
                        autoAlpha: 0,
                        ease: r.tweenEase
                    }),
                    TweenLite.to(r.elems.homePanel, r.tweenTime, {
                        autoAlpha: 1,
                        ease: r.tweenEase,
                        delay: .2
                    }),
                    TweenLite.to(r.elems.gridHolder, r.tweenTime, {
                        top: r.yOffset + "px",
                        ease: r.tweenEase
                    }),
                    $(e).scrollTop(0);
                    var t = "100vh";
                    r.androidInternetHack && (t = "100%"),
                    TweenLite.to(r.elems.homeContainer, r.tweenTime, {
                        height: t,
                        ease: r.tweenEase,
                        onComplete: function() {
                            r.elems.storyHolder.hide(),
                            r.initScrollJack(),
                            $("body, html, .js-page-holder").css({
                                overflow: "hidden",
                                height: "100%"
                            }),
                            r.gridTimer(),
                            viewport().width <= 768 && n()
                        }
                    }),
                    TweenLite.to($(".js-home-overlay, .js-story-header"), r.tweenTime, {
                        autoAlpha: 0,
                        ease: r.tweenEase
                    })
                }
            },
            gridTimer: function() {
                TweenLite.killTweensOf(r.elems.timerCircle),
                TweenLite.to(r.elems.timerCircle, 6, {
                    opacity: 1,
                    ease: Circ.easeOut,
                    onUpdate: function() {
                        var e = Math.round(233 * this.progress());
                        r.elems.timerCircle[0].style.strokeDashoffset = e
                    },
                    onComplete: function() {
                        r.nextItem(!0)
                    }
                })
            },
            killTimer: function() {
                TweenLite.killDelayedCallsTo(r.gridTimer),
                TweenLite.killTweensOf(r.elems.timerCircle)
            },
            createSlide: function(e, t) {
                var n, i, s = 0;
                if (r.currentID = e,
                r.elems.mainGridHolder.append('<div class="js-home-new-grid-holder-' + r.currentID + ' _bg-holder -bg-animate" style="position:absolute;top:' + t + 'px;width:100%;height:100%;"><div class="_image-holder"></div><div class="_image-holder-small"></div><div class="_image-holder-med"></div></div>'),
                $(".js-home-new-grid-holder-" + r.currentID).css({
                    "background-image": "url(/img/grid-bg-1.jpg)"
                }),
                r.elems.homePanel.css({
                    display: "inherit"
                }),
                r.deeplinkID || (s = 1),
                r.deeplinkID || r.isStoryOpen ? r.elems.homePanel.css({
                    opacity: 0
                }) : TweenLite.to(r.elems.homePanel, .8, {
                    autoAlpha: 1,
                    delay: .5,
                    ease: "easeOutSine"
                }),
                r.elems.homePanel.css("background-color", "rgba(" + companiesData[r.currentID].rgb_value + ", .9)"),
                s && r.elems.panelContent.append(r.newMenuHTML),
                n = $($(".js-menu-item")[s]),
                n.find(".js-homepage-company-title").text(companiesData[r.currentID].headline),
                n.find(".js-homepage-company-subtitle").text(companiesData[r.currentID].subheadline),
                crucibleSlugs[r.currentID])
                    n.find(".js-story-link").text(companiesData[r.currentID].cta);
                else {
                    var a = crucibleURLs[r.currentID];
                    n.find(".js-story-link").html('<a class="js-prevent-default" onClick="sq.main.openCompany(\'' + a + "')\">" + companiesData[r.currentID].cta + "</a>")
                }
                for (i = 0; i < companiesData.length; i++)
                    n.find(".js-top-number").text(r.currentID + 1 < 10 ? "0" + (r.currentID + 1) : r.currentID + 1);
                r.currentBackground = $(".js-home-new-grid-holder-" + r.currentID),
                r.currentIntro = $($(".js-menu-item")[s]),
                r.loadBackgroundImage(),
                r.setPanelContentTop(n.find(".js-panel-content"))
            },
            loadBackgroundImage: function() {
                var e = "img-small-" + r.currentID
                  , t = '<img class="js-lazy-image" id="' + e + '" data-img-src="' + companiesData[r.currentID].image_url_small + '">';
                if ($(".js-home-new-grid-holder-" + r.currentID + " ._image-holder-small").html(t),
                e = "img-med-" + r.currentID,
                t = '<img class="js-lazy-image" id="' + e + '" data-img-src="' + companiesData[r.currentID].image_url_med + '">',
                $(".js-home-new-grid-holder-" + r.currentID + " ._image-holder-med").html(t),
                r.skipPreloading)
                    $(".js-home-new-grid-holder-" + r.currentID + " ._image-holder").addClass("-not-preloaded"),
                    $(".js-home-new-grid-holder-" + r.currentID + " ._image-holder").html('<img class="js-lazy-image" data-img-src="' + companiesData[r.currentID].image_url + '">');
                else {
                    var n = []
                      , i = r.getSurroundingSlides();
                    r.loadedBackgrounds[r.currentID] ? $(".js-home-new-grid-holder-" + r.currentID + " ._image-holder").html(r.loadedBackgrounds[r.currentID]) : (r.waitForLoad = r.currentID,
                    n.push(r.currentID)),
                    r.loadedBackgrounds[i.nextSlide] || n.push(i.nextSlide),
                    r.loadedBackgrounds[i.prevSlide] || n.push(i.prevSlide),
                    0 !== n.length && (r.loadQueue.setPaused(!0),
                    r.preloadImages(n))
                }
                r.startImageLoader()
            },
            preloadImages: function(e) {
                for (var t, r = [], n = 0; n < e.length; n++)
                    t = e[n],
                    r.push({
                        id: t,
                        src: companiesData[t].image_url
                    });
                var i = new createjs.LoadQueue;
                i.on("fileload", a, this),
                i.loadManifest(r)
            },
            getSurroundingSlides: function() {
                var e, t, n = r.currentID;
                return e = 0 === n ? companiesData.length - 1 : n - 1,
                t = n == companiesData.length - 1 ? 0 : n + 1,
                {
                    currentSlide: n,
                    prevSlide: e,
                    nextSlide: t
                }
            },
            nextItem: function(e, t, n) {
                var i, s;
                if (!r.isTransitioning && r.currentID != n - 1) {
                    r.waitForLoad && (r.waitForLoad = !1),
                    r.isPastIntro || (t = !1,
                    trackItem("Home", "Home Navigation", "Scroll", "Down Arrow"),
                    r.isPastIntro = !0),
                    t && (r.killTimer(),
                    TweenLite.killDelayedCallsTo(r.gridTimer),
                    TweenLite.delayedCall(20, r.gridTimer)),
                    r.isTransitioning = !0,
                    n ? r.currentID = n - 1 : e ? (r.currentID++,
                    r.currentID == companiesData.length && (r.currentID = 0)) : (r.currentID--,
                    r.currentID < 0 && (r.currentID = companiesData.length - 1)),
                    r.lastBackground = r.currentBackground,
                    r.lastIntro = r.currentIntro,
                    viewport().width <= 1024 && (s = !0),
                    i = s && e ? -1125 : s && !e ? 1125 : e ? 1125 : -1125,
                    trackItem("Home", "Home Navigation", "Scroll", "Story " + (r.currentID + 1)),
                    r.createSlide(r.currentID, i);
                    var a = $($(".js-menu-item")[1]);
                    a.css({
                        top: -i + "px"
                    }),
                    r.elems.mainGridHolder.addClass("-animate").css({
                        transform: "translate(0px," + -i + "px)"
                    }),
                    r.elems.panelContent.addClass("-animate").css({
                        transform: "translate(0px," + i + "px)"
                    }),
                    r.elems.introContent && r.elems.introContent.addClass("-animate").css({
                        transform: "translate(0px," + 2 * i + "px)"
                    }),
                    TweenLite.delayedCall(1.2, r.resetTops, [t])
                }
            },
            resetTops: function(e) {
                r.initButtons(),
                r.elems.mainGridHolder.removeClass("-animate").css({
                    transform: "translate(0px,0px)"
                }),
                r.elems.panelContent.removeClass("-animate").css({
                    transform: "translate(0px,0px)"
                });
                var t = $(".js-menu-item")[1];
                $(t).css({
                    top: "0px"
                }),
                r.currentBackground.css({
                    top: "0px"
                }),
                r.lastIntro && (r.lastIntro.find(".js-circle-loader").asPieProgress("destroy"),
                r.lastIntro.find(".js-circle-preloader").asPieProgress("destroy"),
                $(".js-circle-loader, .js-circle-preloader").html(""),
                r.lastBackground.remove(),
                r.lastIntro.remove()),
                r.elems.timerCircle = $(".progress-circle"),
                r.elems.preloadCircle = $(".preload-circle"),
                e || r.gridTimer(),
                r.isTransitioning = !1
            },
            handleHomeKeys: function(e) {
                38 == e.keyCode ? r.nextItem(!1, !0) : 40 == e.keyCode && r.nextItem(!0, !0)
            },
            initScrollJack: function() {
                r.scrollJackActive || (r.scrollJackActive = !0,
                $(e).on("keyup", r.handleHomeKeys),
                $(e).on({
                    "DOMMouseScroll mousewheel": i
                }),
                r.elems.homeContainer.swipe({
                    swipe: function(e, t) {
                        "up" == t ? r.nextItem(!0, !0) : "down" == t && r.nextItem(!1, !0)
                    }
                }),
                r.elems.homeContainer.addClass("touchMoveAllowed"),
                $(document).on("touchmove", function(e) {
                    for (var t = !1, r = e.target; null != r; ) {
                        if (r.classList && r.classList.contains("touchMoveAllowed")) {
                            t = !0;
                            break
                        }
                        r = r.parentNode
                    }
                    t || e.preventDefault()
                }))
            },
            killScrollJack: function() {
                r.scrollJackActive = !1,
                $(e).off("keyup", r.handleHomeKeys),
                $(e).off("DOMMouseScroll mousewheel"),
                r.elems.homeContainer.swipe("destroy"),
                $(document).off("touchmove")
            },
            pauseHome: function() {
                r.killScrollJack(),
                r.killTimer()
            },
            resumeHome: function() {
                r.initScrollJack(),
                r.gridTimer()
            },
            setPanelContentTop: function(e) {
                if (r.currentIntro) {
                    var t = r.currentIntro.children(".js-panel-content").innerHeight()
                      , n = viewport().height - 100
                      , i = -(t - n) / 2;
                    e || (e = $(".js-panel-content")),
                    e.css({
                        top: i
                    })
                }
            }
        };
        var n = function(e) {
            var t, n, i, s, a, o, u, c, l, f, p, h, d;
            if ("story" == e ? h = !0 : "closeStory" == e && (d = !0),
            !(!h && r.isStoryOpen && viewport().width <= 768)) {
                if (d)
                    return void (r.yOffset = r.savedYOffset);
                if (s = 2e3,
                a = 1125,
                o = r.elems.homeContainer.height(),
                u = viewport().height / o,
                u > 1 && (o = 2 * r.elems.homeContainer.height() - 135),
                r.vHeight = o,
                i = (o - 100) / a,
                t = s * i - viewport().width - 1,
                n = 100,
                s * i < viewport().width && (i = viewport().width / s,
                t = 0,
                n = 100 + -(a * i - (o - 100)) / 2),
                -1 == r.currentID && (c = -((s * i - viewport().width) / 2) + t,
                l = c / i,
                -1 == r.currentID && r.elems.introHolder && (r.elems.introHolder.css({
                    left: l
                }),
                p = viewport().width,
                viewport().width >= 768 && (p -= 100),
                p > 1300 && (p = 1300),
                viewport().width < 768 && viewport().width > viewport().height && (p = 1100),
                $(".js-intro-copy").css({
                    width: p
                }),
                r.introCopyHeight && setTimeout(function() {
                    var e = a * i - (viewport().height - 100);
                    f = (a - r.introCopyHeight) / 2,
                    f -= e / 2,
                    viewport().width < 768 && (f -= 30),
                    viewport().width < 768 && viewport().width > viewport().height && (f -= 100),
                    r.elems.introContent.css({
                        top: f
                    })
                }, 0))),
                t = -t + "px",
                r.xOffset = t,
                r.yOffset = n,
                r.isStoryOpen || r.isStoryOpening || h || d || (r.savedYOffset = n),
                h) {
                    var y = "-25%";
                    viewport().width < 768 && (y = "15%"),
                    TweenLite.to(r.elems.gridHolder, r.tweenTime, {
                        top: y,
                        ease: r.tweenEase
                    })
                } else
                    r.elems.gridHolder.css({
                        transform: "scale(" + i + "," + i + ")",
                        "-webkit-transform": "scale(" + i + "," + i + ")",
                        "-ms-transform": "scale(" + i + "," + i + ")",
                        left: t,
                        top: n + "px"
                    }),
                    r.elems.introHolder && r.elems.introHolder.css({
                        top: -n / i + 100 / i
                    });
                r.elems.storyTitleHolder = $(".js-story-title-holder"),
                r.elems.storyTitle = $(".js-story-title"),
                r.elems.storyTitleHolder.css("width", "100%");
                var g = r.elems.storyTitle.width();
                g > 600 && (g = 600),
                r.elems.storyTitleHolder.css("width", g),
                r.vHeight < 600 ? $(".js-story-subhead").css("display", "none") : $(".js-story-subhead").css("display", "inherit");
                {
                    var m = (viewport().width - r.elems.storyTitleHolder.outerWidth()) / 2;
                    ((o - 100) / 2 - r.elems.storyTitleHolder.outerHeight()) / 2 + 60
                }
                r.elems.storyTitleHolder.css({
                    left: m,
                    marginTop: r.elems.storyCloseButton.height() + 30
                });
                var v = 100 - ($(".js-story-header").height() - ($(".js-home-container").height() - 100)) / 2;
                viewport().width < 768 && (v = -($(".js-story-header").height() - $(".js-home-container").height()) / 2),
                r.setPanelContentTop(),
                $(".js-story-header").css({
                    top: v
                })
            }
        }
          , i = function(e) {
            var t = 15;
            return e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0 ? (r.delta--,
            Math.abs(r.delta) >= t && (r.isTransitioning || setTimeout(function() {
                r.isTransitioning || r.nextItem(!1, !0)
            }, 100))) : (r.delta++,
            Math.abs(r.delta) >= t && (r.isTransitioning || setTimeout(function() {
                r.isTransitioning || r.nextItem(!0, !0)
            }, 100))),
            !1
        }
          , s = function() {}
          , a = function(e) {
            var t;
            if (t = e.item,
            "bg_intro" != e.item.id ? r.loadedBackgrounds[e.item.id] = e.result : r.startHome(e.result),
            r.waitForLoad !== !1 && r.loadedBackgrounds[r.waitForLoad]) {
                r.loadQueue.setPaused(!1);
                var n = $(".js-home-new-grid-holder-" + r.waitForLoad + " ._image-holder");
                n.html(r.loadedBackgrounds[r.waitForLoad]),
                n.css({
                    opacity: 0
                }),
                setTimeout(function() {
                    n.addClass("-animate").css({
                        opacity: 1
                    }),
                    r.waitForLoad = !1
                }, 1e3)
            }
        };
        return t()
    }(window)
});