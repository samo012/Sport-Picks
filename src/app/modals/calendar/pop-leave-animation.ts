import { createAnimation } from "@ionic/core";

export function PopLeaveAnimation(baseEl: HTMLElement) {
  const backdrop = createAnimation()
    .addElement(document.querySelector("ion-backdrop"))
    .fromTo("opacity", 0.03, 0);

  const content = createAnimation()
    .addElement(baseEl.querySelector(".popover-content"))
    .fromTo("transform", "translateY(0)", "translateY(100%)");

  const parent = createAnimation()
    .addElement(baseEl)
    .easing("cubic-bezier(0.36,0.66,0.04,1)")
    .duration(400)
    .addAnimation([backdrop, content]);

  return parent;
}
