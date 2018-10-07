/**
 * @author arodic / https://github.com/arodic
 */

import {Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../lib/three.module.js";
import {InteractiveMixin} from "../Interactive.js";
// import {Animation} from "../../lib/Animation.js";

// Reusable utility variables
const _ray = new Raycaster();
const _rayTarget = new Vector3();
const _tempVector = new Vector3();

// events
const changeEvent = { type: "change" };

export const TransformControlsMixin = (superclass) => class extends InteractiveMixin(superclass) {
	constructor(props) {
		super(props);

		this.visible = false;

		this.defineProperties({
			active: false,
			pointStart: new Vector3(),
			pointEnd: new Vector3(),
			worldPositionStart: new Vector3(),
			worldQuaternionStart: new Quaternion(),
			worldScaleStart: new Vector3(), // TODO: remove
			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3(),
			plane: new Plane()
		});

		// this.add(this.planeMesh = new Mesh(new PlaneBufferGeometry(1000, 1000, 10, 10), new MeshBasicMaterial({wireframe: true})));
	}
	objectChanged() {
		super.objectChanged();
		let hasObject = this.object ? true : false;
		this.visible = hasObject;
		if (!hasObject) {
			this.active = false;
			this.axis = null;
		}
		this.animation.startAnimation(1.5);
	}
	// TODO: better animation trigger
	// TODO: also trigger on object change
	// TODO: Debug stalling animations on hover
	enabledChanged(value) {
		super.enabledChanged(value);
		this.animation.startAnimation(0.5);
	}
	activeChanged() {
		this.animation.startAnimation(0.5);
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();
		this.updatePlane();
	}
	onPointerHover(pointers) {
		if (!this.object || this.active === true) return;

		const camera = this.camera;
		_ray.setFromCamera(pointers[0].position, camera); //TODO: unhack

		const intersect = _ray.intersectObjects(this.pickers, true)[0] || false;
		if (intersect) {
			this.axis = intersect.object.name;
		} else {
			this.axis = null;
		}
	}
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;

		const camera = this.camera;
		_ray.setFromCamera(pointers[0].position, camera);

		this.updatePlane();
		const planeIntersect = _ray.ray.intersectPlane(this.plane, _rayTarget);
		let space = (this.axis === 'E' || this.axis === 'XYZ') ? 'world' : this.space;
		if (planeIntersect) {
			this.object.updateMatrixWorld();
			if (this.object.parent) {
				this.object.parent.updateMatrixWorld();
			}
			this.positionStart.copy(this.object.position);
			this.quaternionStart.copy(this.object.quaternion);
			this.scaleStart.copy(this.object.scale);
			this.object.matrixWorld.decompose(this.positionStart, this.quaternionStart, this.scaleStart);
			this.pointStart.copy(planeIntersect).sub(this.positionStart);
			if (space === 'local') this.pointStart.applyQuaternion(this.quaternionStart.clone().inverse());
			this.active = true;
		}
	}
	onPointerMove(pointers) {
		let axis = this.axis;
		let object = this.object;
		let space = (axis === 'E' || axis === 'XYZ') ? 'world' : this.space;


		if (object === undefined || axis === null || this.active === false || pointers[0].button !== 0) return;

		const camera = this.camera;
		_ray.setFromCamera(pointers[0].position, camera);

		const planeIntersect = _ray.ray.intersectPlane(this.plane, _tempVector);

		if (!planeIntersect) return;

		this.pointEnd.copy(planeIntersect).sub(this.positionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.quaternionStart.clone().inverse());

		this.transform();

		this.object.updateMatrixWorld();
		this.dispatchEvent(changeEvent);
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			this.active = false;
			if (pointers.removed[0].pointerType === 'touch') this.axis = null;
		} else {
			if (pointers[0].button === -1) this.axis = null;
		}
	}
	transform() {}
	updateAxisMaterial(axis) {
		super.updateAxisMaterial(axis);

		const mat = axis.material;
		const h = axis.material.highlight;

		if (!this.enabled) mat.highlight = (10 * h - 1.1) / 11;
	}
	updatePlane() {
		const axis = this.axis;
		const normal = this.plane.normal;
		const camera = this.camera;

		if (axis === 'X') normal.copy(this.worldX).cross(_tempVector.copy(this.eye).cross(this.worldX));
		if (axis === 'Y') normal.copy(this.worldY).cross(_tempVector.copy(this.eye).cross(this.worldY));
		if (axis === 'Z') normal.copy(this.worldZ).cross(_tempVector.copy(this.eye).cross(this.worldZ));
		if (axis === 'XY') normal.copy(this.worldZ);
		if (axis === 'YZ') normal.copy(this.worldX);
		if (axis === 'XZ') normal.copy(this.worldY);
		if (axis === 'XYZ' || axis === 'E') camera.getWorldDirection(normal);

		this.plane.setFromNormalAndCoplanarPoint(normal, this.position);

		// this.parent.add(this.planeMesh);
		// this.planeMesh.position.set(0,0,0);
		// this.planeMesh.lookAt(normal);
		// this.planeMesh.position.copy(this.position);
	}
};
