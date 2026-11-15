/** jsdom may not implement <dialog>.show/showModal/close; this fills the gap for component tests. */
export function installDialogShim() {
  const proto = HTMLDialogElement.prototype as Partial<HTMLDialogElement>;
  proto.show = function show(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
