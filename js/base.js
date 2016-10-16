'use strict';
var SPRITE_W = 396;
var SPRITE_H = 720;
var SPRITE_Y = 5;
var SPRITES = [
    {
        audio: 'https://s.cdn.turner.com/adultswim/big/audio/misc/deer-boy/DeerBoy.mp3',
        src: 'https://s.cdn.turner.com/adultswim/big/img/misc/deer-boy/DeerBoy.png',
        columns: 6,
        rows: 8,
        frames: 47
    },
    {
        audio: 'https://s.cdn.turner.com/adultswim/big/audio/misc/deer-boy/HeyYo_1.mp3',
        src: 'https://s.cdn.turner.com/adultswim/big/img/misc/deer-boy/HeyYo.png',
        columns: 5,
        rows: 7,
        frames: 31
    }
];
var isPlaying = false;
var playCount = 0;
var currentIndex = 0;
var deerScene = undefined;
var deerSprites = undefined;
var deerTicker = undefined;
function paintSprite() {
    deerSprites[currentIndex].cycle.next(1, true);
}
function resetSprite() {
    var _deerSprites$currentI = deerSprites[currentIndex];
    var cycle = _deerSprites$currentI.cycle;
    var sprite = _deerSprites$currentI.sprite;
    deerTicker.pause();
    cycle.reset(true);
    sprite.setOpacity(0);
}
function setupSprite() {
    var _deerSprites$currentI2 = deerSprites[currentIndex];
    var cycle = _deerSprites$currentI2.cycle;
    var sprite = _deerSprites$currentI2.sprite;
    sprite.setOpacity(1);
    sprite.update();
}
function toggleSprites(play, inc) {
    resetSprite();
    if (inc) {
        currentIndex = currentIndex >= deerSprites.length - 1 ? 0 : currentIndex + 1;
    }
    setupSprite();
    if (play) {
        deerTicker.resume();
        soundManager.play('deerSound_' + currentIndex);
    }
}
function initAudio() {
    return new Promise(function (resolve) {
        soundManager.setup({
            onready: function onready() {
                SPRITES.forEach(function (spr, i) {
                    soundManager.createSound({
                        id: 'deerSound_' + i,
                        url: spr.audio,
                        autoLoad: true,
                        autoPlay: false,
                        onfinish: function onfinish() {
                            resetSprite();
                            isPlaying = false;
                        }
                    });
                });
                resolve();
            }
        });
    });
}
function initSprites() {
    currentIndex = 0;
    playCount = 0;
    if (deerScene) {
        deerScene.reset();
    }
    deerScene = window.DEER_SCENE = sjs.Scene({
        w: 396,
        h: 720,
        parent: document.getElementById('Deer'),
        autoPause: false
    });
    deerSprites = SPRITES.map(function (spr, i) {
        var cycles = Array.from({ length: spr.frames }).map(function (__, i) {
            return [
                i % spr.columns * SPRITE_W,
                Math.floor(i / spr.columns % spr.rows) * SPRITE_H,
                SPRITE_Y
            ];
        });
        var cycle = deerScene.Cycle(cycles);
        var sprite = deerScene.Sprite(spr.src);
        sprite.size(SPRITE_W, SPRITE_H);
        sprite.setOpacity(0);
        sprite.update();
        cycle.addSprite(sprite);
        return {
            sprite: sprite,
            cycle: cycle
        };
    });
    deerTicker = deerScene.Ticker(paintSprite, {
        tickDuration: 15,
        useAnimationFrame: true
    });
    return new Promise(function (resolve) {
        deerScene.loadImages(SPRITES.map(function (spr) {
            return spr.src;
        }), function () {
            deerTicker.run();
            deerTicker.pause();
            toggleSprites();
            resolve();
        });
    });
}
$(function () {
    var $Deer = $('#Deer');
    var $DeerButton = $('#DeerButton');
    function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!isPlaying) {
            isPlaying = true;
            toggleSprites(true, playCount > 0);
            playCount++;
        }
    }
    Promise.all([
        initAudio(),
        initSprites()
    ]).then(function () {
        $DeerButton.on('click', onClick);
    });
});
