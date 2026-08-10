import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useLang } from "../i18n";
import { waLink } from "../config";

const WhatsAppButton = () => {
  const { t } = useLang();
  const [hover, setHover] = useState(false);
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      data-testid="whatsapp-float"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-coffee text-ivory pl-4 pr-5 py-3 shadow-lg shadow-coffee/20 hover:bg-coral transition-colors duration-300"
    >
      <MessageCircle size={20} />
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-xs tracking-widest uppercase whitespace-nowrap overflow-hidden"
          >
            {t.common.chat}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
};

export default WhatsAppButton;
