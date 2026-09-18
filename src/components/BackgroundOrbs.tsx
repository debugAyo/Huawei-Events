const ORBS = [
  {
    id: "orb-top",
    orbClass: "orb-a",
    placement: "left-1/2 top-[-14rem] h-[30rem] w-[30rem] -translate-x-1/2",
    background:
      "radial-gradient(circle at center, rgba(199,0,11,0.34), transparent 62%)",
  },
  {
    id: "orb-left",
    orbClass: "orb-b",
    placement: "left-[6%] top-[58%] h-[24rem] w-[24rem]",
    background:
      "radial-gradient(circle at center, rgba(199,0,11,0.25), transparent 62%)",
  },
  {
    id: "orb-right",
    orbClass: "orb-c",
    placement: "right-[4%] top-[30%] h-[22rem] w-[22rem]",
    background:
      "radial-gradient(circle at center, rgba(199,0,11,0.3), transparent 62%)",
  },
];

export function BackgroundOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {ORBS.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-3xl ${orb.placement} ${orb.orbClass}`}
          style={{ background: orb.background }}
        />
      ))}
    </div>
  );
}
