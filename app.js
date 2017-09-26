(function() {
    var $,
        ele,
        container,
        canvas,
        num,
        prizes,
        btn,
        deg = 0,
        fnGetPrize,
        fnGotBack,
        optsPrize;

    var cssPrefix,
        eventPrefix,
        vendors = {
            '': '',
            Webkit: 'webkit',
            Moz: '',
            O: 'o',
            ms: 'ms'
        },
        testEle = document.createElement('p'),
        cssSupport = {};

    var registeredEvents = [];

    Object.keys(vendors).some(function(vendor) {
        if (testEle.style[vendor + (vendor ? 'T' : 't') + 'ransitionProperty'] !== undefined) {
            cssPrefix = vendor ? '-' + vendor.toLowerCase() + '-' : '';
            eventPrefix = vendors[vendor];
            return true;
        }
    });

    function normalizeEvent(name) {
        return eventPrefix ? eventPrefix + name : name.toLowerCase();
    }

    function normalizeCss(name) {
        name = name.toLowerCase();
        return cssPrefix ? cssPrefix + name : name;
    }

    cssSupport = {
        cssPrefix: cssPrefix,
        transform: normalizeCss('Transform'),
        transitionEnd: normalizeEvent('TransitionEnd')
    }

    var transform = cssSupport.transform;
    var transitionEnd = cssSupport.transitionEnd;

    function init(opts) {
        fnGetPrize = opts.getPrize;
        fnGotBack = opts.gotBack;

        opts.config(function(data) {
            prizes = opts.prizes = data;
            num = prizes.length;
            draw(opts);
        });

        events();
    }

    $ = function(id) {
        return document.getElementById(id);
    };

    function draw(opts) {
        opts = opts || {};
        if (!opts.id || num >>> 0 === 0) return;

        var id = opts.id,
            rotateDeg = 360 / num / 2 + 90,
            ctx,
            prizeItems = document.createElement('ul'),
            turnNum = 1 / num,
            html = [];

        ele = $(id);
        canvas = ele.querySelector('.turntable-canvas');
        container = ele.querySelector('.turntable-container');
        btn = ele.querySelector('.turntable-btn');

        if (!canvas.getContext) {
            showMsg('Sorry, current browser does not support Canvas');
            return;
        }

        ctx = canvas.getContext('2d');

        for (var i = 0; i < num; i++) {

            ctx.save();
            ctx.beginPath();
            ctx.translate(150, 150);
            ctx.moveTo(0, 0);
            ctx.rotate((360 / num * i - rotateDeg) * Math.PI/180);
            ctx.arc(0, 0, 150, 0,  2 * Math.PI / num, false);

            if (i % 2 === 0) {
                ctx.fillStyle = '#ffb820';
            }else{
                ctx.fillStyle = '#ffcb3f';
            }

            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = '#e4370e';
            ctx.stroke();

            ctx.restore();

            html.push('<li class="turntable-item"> <span style="' + transform + ': rotate(' + i * turnNum + 'turn)">' + opts.prizes[i] + '</span> </li>');
            if ( (i+1) === num ) {
                prizeItems.className = 'turntalbe-list';
                container.appendChild(prizeItems);
                prizeItems.innerHTML = html.join('');
            }
        }
    }

    function showMsg(msg){
        alert(msg);
    }

    function runRotate(deg){
        container.style[transform] = 'rotate('+ deg +'deg)';
    }

    function isRegistered(button, event) {
        for (var i = 0; i < registeredEvents.length; i++) {
            var eve = registeredEvents[i][1];
            var btn = registeredEvents[i][0];
            if (eve === event  && btn === button) {
                return true;
            }
        }
        return false;
    }

    function events() {

        if (isRegistered(btn, 'click') === true) {
            return;
        }

        bindEvent(btn, 'click', function() {

            addClass(btn, 'disabled');

            fnGetPrize(function(data) {
                optsPrize = {
                    prizeId: data[0],
                    chances: data[1]
                };
                deg = deg || 0;
                deg = deg + (360 - deg % 360) + (360 * 10 - data[0] * (360 / num));
                runRotate(deg);
            });

            if (isRegistered(container, transitionEnd) === false) {
                bindEvent(container, transitionEnd, getPrize);
                registeredEvents[registeredEvents.length] = [container, transitionEnd];
            }

        });

        registeredEvents[registeredEvents.length] = [btn, 'click'];
    }

    function getPrize() {

        if (optsPrize.chances > 0){
            removeClass(btn, 'disabled');
        }
        optsPrize.chances -- ;
        fnGotBack(prizes[optsPrize.prizeId]);
    }

    function bindEvent(ele, event, fn) {

        if (typeof addEventListener === 'function') {

            ele.addEventListener(event, fn, false);
        }  else if (ele.attachEvent) {
            ele.attachEvent('on' + event, fn);
        }
    }

    function hasClass(ele, cls) {
        if (!ele || !cls) return false;
        if (ele.classList) {
            return ele.classList.contains(cls);
        } else {
            return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        }
    }

    function addClass(ele, cls) {
        if (ele.classList) {
            ele.classList.add(cls);
        } else {
            if (!hasClass(ele, cls)) ele.className += '' + cls;
        }
    }

    function removeClass(ele, cls) {
        if (ele.classList) {
            ele.classList.remove(cls);
        } else {
            ele.className = ele.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    var turntable = {
        init: function(opts) {
            return init(opts);
        }
    }

    window.turntable === undefined && (window.turntable = turntable);

    if (typeof define === 'function' && define.amd) {
        define('canvas-turntable', [], function() {
            return turntable;
        });
    }

}());
