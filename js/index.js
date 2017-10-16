var container, stats;
var camera, scene, renderer;

var waterNormals;
var envTexture;
var azimuth = .45843;
var inclination = .3011;

var loader = new THREE.TextureLoader();
var clock = new THREE.Clock();

var time=0;
var uniforms;
var v;
var light;
var rusty;

loader.load( './images/waternormals.jpg', function ( t ) {
    t.mapping = THREE.UVMapping;
    waterNormals = t;
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    rusty = loader.load( './images/tex08.jpg')
    rusty.wrapS = rusty.wrapT = THREE.RepeatWrapping;

    init();
    animate();
})

function initSky() {

    // Add Sky Mesh
    sky = new THREE.Sky();
    scene.add( sky.mesh );

    // Add Sun Helper
    sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 20, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0x00bfff } )
    );
    sunSphere.visible = false;
    scene.add( sunSphere );

    uniforms = sky.uniforms;
    uniforms.turbidity.value = 0.355;
    uniforms.rayleigh.value = 0.5;
    uniforms.luminance.value = 0.001;
    uniforms.mieCoefficient.value = 0.128;
    uniforms.mieDirectionalG.value = 1.6;

    moveSun();
}

function moveSun(){
    var distance = 45000;

    var theta = Math.PI * ( inclination - 0.5 );
    var phi = 2 * Math.PI * (azimuth - 0.5 );

    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

    sky.uniforms.sunPosition.value.copy( sunSphere.position );
}

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild( renderer.domElement );
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 4500 );
    camera.position.set( 0, 15, 0 );
    camera.rotation.set(-0,0,0);

    initSky();

    water = new THREE.Water( renderer, camera, scene, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha:  .80,
        sunDirection:  sky.uniforms.sunPosition.value.normalize(),
        sunColor: 0xffe87d,
        waterColor: 0x345f6f,
        distortionScale: 40.0,
    } );
    mirrorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry( 4400, 4400,120,120 ),
        water.material
    );
    mirrorMesh.add( water );
    mirrorMesh.rotation.x = - Math.PI * 0.5;
    scene.add( mirrorMesh );

    v = mirrorMesh.geometry.vertices;

    //LIGHT
    var ambient = new THREE.AmbientLight( 0xf5ebce, 0.25 );
    scene.add(ambient);

    light = new THREE.DirectionalLight( 0xf5ebce, 0.8 );
    light.position.set( 0, 0, 0 );

    light.castShadow = true;
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 40, .7, 4000, 4800 ) );
    light.shadow.bias = 0.0000001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add( light );

    n = 110;
    var elementMaterial = new THREE.MeshPhongMaterial( {  specular: 0xf5ebce, shininess: 23,specularMap:rusty, shading: THREE.FlatShading,map:rusty } );

    for (var i = n - 1; i >= 0; i--) {
        var elementGeometry =  new THREE.CylinderGeometry( 5, 50, (random(i)+1) *20, 7 );
        var addU = Math.random();
        var addV = Math.random();
        for ( var z = 0; z < elementGeometry.faces.length; z ++ ) {
            elementGeometry.faceVertexUvs[ 0 ][ z ][ 0 ].x += addU;
            elementGeometry.faceVertexUvs[ 0 ][ z ][ 0 ].y += addV;
            elementGeometry.faceVertexUvs[ 0 ][ z ][ 1 ].x += addU;
            elementGeometry.faceVertexUvs[ 0 ][ z ][ 1 ].y += addV;
            elementGeometry.faceVertexUvs[ 0 ][ z ][ 2 ].x += addU;
            elementGeometry.faceVertexUvs[ 0 ][ z ][ 2 ].y += addV;
        }
        elementGeometry.uvsNeedUpdate = true;

        var element = new THREE.Mesh(elementGeometry, elementMaterial);
        // scene.add(element);

        element.position.y= elementGeometry.parameters.height/2 -5;
        element.position.x = (random(i+214)-.5)* 1500;
        element.position.z = -random(i*35) * 1500 -100;
        element.rotation.set(random(i)*Math.PI/20,0,0);

        element.receiveShadow = true;
        element.castShadow = true;
    }
}
//
function animate() {

    var delta = clock.getDelta();
    time += delta * 0.5;

    for (var i = v.length - 1; i >= 0; i--) {
        v[i].z =Math.sin(i*1+time*-1)*3;
    }
    camera.position.y=v[7320].z*1.5 +60;

    mirrorMesh.geometry.verticesNeedUpdate = true;

    moveSun();
    water.material.uniforms.time.value -= 1.0 / 60.0;
    water.sunDirection = sky.uniforms.sunPosition.value.normalize()//sunSphere.position.normalize()
    light.position.copy( sunSphere.position);

    water.render();

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    window.addEventListener('resize', onWindowResize, false);

}

function random(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}
