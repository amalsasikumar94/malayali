import * as THREE from 'three'
import { beats, newPose } from './choreography'

/** Per-frame rig state shared between the can, the water effects and the lights. */
export const rig = {
  pose: newPose(),
  beats: beats(0),
  /** World position of the can (the backdrop’s light pool follows it). */
  center: new THREE.Vector3(),
  /** The can’s spin group, world matrix (can space → world). */
  spinMatrix: new THREE.Matrix4(),
  /** rig.time of the last tap on the can. */
  tapAt: -10,
  /** Damped drama dial, 0..1. */
  drama: 0,
  mouth: new THREE.Vector3(),
  mouthDir: new THREE.Vector3(0, -1, 0),
  time: 0,
}
