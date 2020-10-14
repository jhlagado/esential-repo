export class Vector {
  constructor(public x: number, public y: number, public z: number) {}

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  invert() {
    return new Vector(-this.x, -this.y, -this.z);
  }
  scale(s) {
    return new Vector(this.x * s, this.y * s, this.z * s);
  }
  subtract(v) {
    return this.add(v.invert());
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z + v.z;
  }
  rk4(h, fn) {
    // perform a step of rk4 using the given step size and function
    var k1 = fn(this).scale(h),
      k2 = fn(this.add(k1.scale(0.5))).scale(h),
      k3 = fn(this.add(k2.scale(0.5))).scale(h),
      k4 = fn(this.add(k3)).scale(h);
    return this.add(
      k1
        .add(k2.scale(2))
        .add(k3.scale(2))
        .add(k4)
        .scale(1 / 6),
    );
  }
  toString() {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
  }
}
