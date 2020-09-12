import { createAnimation } from "@ionic/core";

export function PopEnterAnimation(baseEl: HTMLElement) {
  const backdrop = createAnimation()
    .addElement(document.querySelector("ion-backdrop"))
    .fromTo("opacity", 0.01, 0.3);

  const popover = createAnimation()
    .addElement(baseEl.querySelector(".popover-wrapper"))
    .beforeStyles({ opacity: 1, width: "100%", height: "100% " })
    .fromTo("transform", "translateY(100%)", "translateY(0)");

  const content = createAnimation()
    .addElement(baseEl.querySelector(".popover-content"))
    .beforeStyles({
      "margin-top": "auto",
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      "transform-origin": "bottom",
      "border-radius": "45px 45px 0 0"
    })
    .afterStyles({
      top: "auto",
      right: 0,
      left: 0,
      bottom: 0,
      width: "100%",
      "box-shadow": "1px 0px 15px 2px #8e8e8e",
      "border-radius": "45px 45px 0 0"
    })
    .fromTo("transform", "translateY(100%)", "translateY(0)");

  const parent = createAnimation()
    .addElement(baseEl)
    .easing("cubic-bezier(0.36,0.66,0.04,1)")
    .duration(600)
    .addAnimation([backdrop, popover, content]);
  return parent;
}
