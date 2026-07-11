import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface MobileCatalogShortcutProps {
  onClick: () => void;
}

export function MobileCatalogShortcut({ onClick }: MobileCatalogShortcutProps) {
  return (
    <button className="mobile-shop pressable" onClick={onClick}>
      <span>Browse departments</span>
      <ArrowRightIcon aria-hidden="true" />
    </button>
  );
}
