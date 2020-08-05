/*
* 初始化相机，并设置相机的位置，并返回相机对象
*
* */
function initCamera(initialPosition) {
  let position = (initialPosition!==null)?initialPosition:new THREE.Vector3(-30,40,30);
  let camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
  camera.position.copy(position);
  camera.lookAt(new THREE.Vector3(0,0,0));

  return camera;
}

/*
* 初始化渲染器，并设置阴影效果开启
* */
function initRenderer(additionalProperties) {
  let props = (typeof additionalProperties !=='undefined' && additionalProperties) ?additionalProperties:{};
  let renderer = new THREE.WebGLRenderer(props);
  //开启阴影渲染
  renderer.shadowMap.enabled = true;
  //设置软阴影
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth,window.innerHeight);
  console.log(document.getElementById("WebGL"));
  document.getElementById('WebGL').appendChild(renderer.domElement);

  return renderer;
}

/*
* 初始化性能监控
* */
function initStats(type) {
  //当type存在且不是非数字时解析为int数值，否则默认为0
  let panelType = (typeof type !=='undefined' && type) && (!NaN(type))?parseInt(type):0;
  let stats = new Stats();
  stats.setMode(panelType);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.getElementById('WebGL').appendChild(stats.domElement);
  return stats;
}

/*
* 初始化轨迹球控件，让我们可以自由的旋转和移动
* */
function initTrackballControls(camera, renderer) {
  let trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

  return trackballControls;
}

function BaseLoaderScene(providedCamera,shouldAddLights,shouldRotate,updateMesh){
  self = this;

  this.scene = new THREE.Scene();
  this.stats = initStats();
  /*
  * Clock本质是对Date进行封装，提供了一些方法和属性
  *   属性：
  *     .aotoStart:Boolean
  *       如果设置为true，则在第一次update时开启时钟Clock，默认值是true
  *     .startTime:Float
  *       存储时钟Clock最后一次调用start方法的时间
  *     .endTime:Float
  *       存储时钟Clock最后一次调用start.getElapsedTime或getDelta方法的时间
  *     .elapsedTime:Float
  *       保存时钟Clock运行的总时长
  *     .running:Boolean
  *       判断时钟Clock是否在运行
  *   方法：
  *     start():
  *       启动时钟，同时将startTime和oldTime设置为当前时间，设置elapsedTime为0，并且设置running为true
  *     getElapsedTime():
  *       获取自时钟启动后的秒数，并且将oldTime设置为当前时间，如果autoStart为true且时钟未运行，则会被启动
  *     getDelat():
  *       获取自oldTime设置后到当前的秒数，同时将oldTime设置为当前时间，如果autoStart设置为true且时钟未运行，则会被启动。
  * */
  this.clock = new THREE.Clock();
  this.camera = providedCamera;
  this.withLights = (shouldAddLights!==undefined)?shouldAddLights:true;
  this.shouldRotate = (shouldRotate!==undefined)?shouldRotate:true;
  this.updateMesh = updateMesh;

  //初始化renderer函数
  this.renderer = initRenderer({antialias:true});

  this.trackballControls = initTrackballControls(this.camera,this.renderer);

  this.render = function (mesh,camera) {
    self.scene.add(mesh);
    self.camera = camera;
    self.mesh = mesh;
    self._render();
  };

  this._render = function () {
    self.stats.update();
    requestAnimationFrame(self._render);
    self.trackballControls.update(self.clock.getDelta());
    if(updateMesh){
      this.updateMesh(self.mesh);
    }
    if(shouldRotate){
      self.mesh.rotation.z+=0.01;
    }
    self.renderer.render(self.scene,self.camera);
  };

  this._addLights = function () {
    let keyLight = new THREE.SpotLight(0xffffff);
    keyLight.position.set(0, 80, 80);
    keyLight.intensity = 2;
    keyLight.lookAt(new THREE.Vector3(0, 15, 0));
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.mapSize.width = 4096;
    this.scene.add(keyLight);

    let backlight1 = new THREE.SpotLight(0xaaaaaa);
    backlight1.position.set(150, 40, -20);
    backlight1.intensity = 0.5;
    backlight1.lookAt(new THREE.Vector3(0, 15, 0));
    this.scene.add(backlight1);

    let backlight2 = new THREE.SpotLight(0xaaaaaa);
    backlight2.position.set(-150, 40, -20);
    backlight2.intensity = 0.5;
    backlight2.lookAt(new THREE.Vector3(0, 15, 0));
    this.scene.add(backlight2);
  };

  // add the lights
  if (this.withLights) this._addLights();
}