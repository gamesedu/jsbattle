var assert = require('assert');
var sinon = require('sinon');

var CollisionResolver = require('../app/scripts/CollisionResolver.js');
var BattlefieldMock = require('./mock/BattlefieldMock.js');
var TankMock = require('./mock/TankMock.js');
var BulletMock = require('./mock/BulletMock.js');

describe('CollisionResolver', function() {

  describe('constructor', function() {

    it('should work', function() {
      var resolver = new CollisionResolver();
      assert(resolver);
    });

  });

  describe('checkTank', function() {

    it('should detect collision with a wall', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank = new TankMock();
      tank.x = 2;
      tank.y = 100;

      var result = resolver.checkTank(tank);

      assert(result === false);
      assert(tank.onWallHit.called);
    });

    it('should detect collision with an enemy', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;

      var tank2 = new TankMock();
      tank2.x = 210;
      tank2.y = 210;

      resolver.checkTank(tank1);
      var result = resolver.checkTank(tank2);

      assert(result === false);
      assert(tank2.onEnemyHit.called);
    });

    it('should not detect a collision on free space', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      var tank2 = new TankMock();
      tank2.x = 300;
      tank2.y = 200;

      assert(resolver.checkTank(tank1));
      assert(resolver.checkTank(tank2));
    });

  });

  describe('hitTestBullet', function() {

    it('should detect collision with a wall', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var bullet = new BulletMock(new TankMock(), 1);
      bullet.x = 2;
      bullet.y = 100;

      var result = resolver.hitTestBullet(bullet);

      assert(bullet.onWallHit.called);
      assert(result);
    });

    it('should detect collision with an enemy', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var bullet = new BulletMock(new TankMock(), 1);
      bullet.x = 200;
      bullet.y = 200;

      var tank = new TankMock();
      tank.x = 200;
      tank.y = 200;
      resolver.updateTank(tank);

      var result = resolver.hitTestBullet(bullet);

      assert(bullet.onEnemyHit.called);
      assert(result);
    });

    it('should not detect a collision on free space', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var bullet = new BulletMock(new TankMock(), 1);
      bullet.x = 200;
      bullet.y = 300;

      var tank = new TankMock();
      tank.x = 200;
      tank.y = 200;
      resolver.updateTank(tank);

      var result = resolver.hitTestBullet(bullet);

      assert(!result);
    });

  });


  describe('scanTanks', function() {

    it('should detect an enemy', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      var tank2 = new TankMock();
      tank2.x = 400;
      tank2.y = 200;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      var result = resolver.scanTanks(tank1);

      assert(result);
      assert(tank1.onEnemySpot.calledWith(tank2));
      assert(tank2.onTargetingAlarm.called);
    });


    it('should not detect a bullet', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;
      var owner = new TankMock();
      owner.x = 0;
      owner.y = 0;
      owner.angle = 0;
      owner.gunAngle = 0;

      var bullet = new BulletMock(owner, 0.3);
      bullet.x = 400;
      bullet.y = 200;

      resolver.checkTank(tank1);
      resolver.hitTestBullet(bullet);

      var result = resolver.scanTanks(tank1);

      assert(!result);
      assert(tank1.onBulletSpot.notCalled);
    });

    it('should not detect anything on free space', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      var tank2 = new TankMock();
      tank2.x = 200;
      tank2.y = 400;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      var result = resolver.scanTanks(tank1);
      assert(!result);
      assert(tank1.onEnemySpot.notCalled);
    });

  });


  describe('scanBullets', function() {

    it('should not detect an enemy', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      var tank2 = new TankMock();
      tank2.x = 400;
      tank2.y = 200;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      var result = resolver.scanBullets(tank1);

      assert(!result);
      assert(tank1.onEnemySpot.notCalled);
      assert(tank2.onTargetingAlarm.notCalled);
    });


    it('should detect a bullet', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      var bullet = new BulletMock(new TankMock(), 0.3);
      bullet.x = 400;
      bullet.y = 200;

      resolver.checkTank(tank1);
      resolver.hitTestBullet(bullet);

      var result = resolver.scanBullets(tank1);

      assert(result);
      assert(tank1.onBulletSpot.calledWith(bullet));
    });

    it('should not detect anything on free space', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank1 = new TankMock();
      tank1.x = 200;
      tank1.y = 200;
      tank1.angle = 0;
      tank1.radarAngle = 0;
      tank1.radarRange = 500;

      var tank2 = new TankMock();
      tank2.x = 200;
      tank2.y = 400;

      resolver.checkTank(tank1);
      resolver.checkTank(tank2);

      var result = resolver.scanBullets(tank1);
      assert(!result);
      assert(tank1.onEnemySpot.notCalled);
    });

  });

  describe('updateTank', function() {

    it('change position of a tank', function() {
      var resolver = new CollisionResolver();
      var battlefield = new BattlefieldMock();
      battlefield.width = 500;
      battlefield.height = 500;
      resolver.updateBattlefield(new BattlefieldMock());

      var tank = new TankMock();
      tank.x = 2;
      tank.y = 100;

      var result = resolver.checkTank(tank);

      assert(result === false);
      assert(tank.onWallHit.called);

      tank.x = 200;
      tank.y = 100;

      result = resolver.checkTank(tank);

      assert(result === true);

    });

  });



});