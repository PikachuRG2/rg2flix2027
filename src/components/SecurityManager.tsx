import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SecurityManager = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Se for admin, não aplica as restrições para permitir debug
    if (isAdmin) return;

    // 1. Desabilitar Botão Direito (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Desabilitar Atalhos de Teclado (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Element Selector)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // 3. Proteção contra extensões e Debugger (Anti-Debugger Loop)
    // Se o DevTools for aberto, o debugger vai pausar a execução.
    // Medimos o tempo para detectar se houve pausa (o que indica DevTools aberto).
    const antiDebugger = setInterval(() => {
      if (!isAdmin) {
        const startTime = Date.now();
        // eslint-disable-next-line no-debugger
        debugger; 
        const endTime = Date.now();
        
        // Se demorar mais de 100ms entre o startTime e o endTime, 
        // significa que o script foi pausado pelo debugger (DevTools aberto)
        if (endTime - startTime > 100) {
          // Limpa tudo e sai do site imediatamente
          document.body.innerHTML = "<h1>Acesso Negado</h1>";
          window.location.href = "about:blank";
        }
      }
    }, 500);

    // 4. Detecção adicional via redimensionamento (comum em DevTools acoplados)
    const handleResize = () => {
      if (!isAdmin) {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          window.location.href = "about:blank";
        }
      }
    };

    // Adicionar listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Limpeza ao desmontar
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      clearInterval(antiDebugger);
    };
  }, [isAdmin]);

  return null; // Este componente não renderiza nada visualmente
};

export default SecurityManager;
