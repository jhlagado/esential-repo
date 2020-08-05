(module
  (import "console" "log" (func $log (param i32)))
  (func $addTwo (export "addTwo") (param $p1 i32) (param $p2 i32) (result i32) (local $l1 i32)
    local.get 0
    local.get 1
    i32.add
    local.set $l1
    local.get $l1
    call $log
    local.get $l1
  )
)

