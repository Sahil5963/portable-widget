import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { cn } from "../util";

interface ExpandableChatbotProps {
  helpdeskDomain: string;
  initialMessage: string;
}

const ExpandableChatbot: React.FC<ExpandableChatbotProps> = ({ helpdeskDomain, initialMessage }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      const mP = event.data.url;
      const mF = `${origin}${mP}`;

      //remove query params from fullUrl
      const url = new URL(mF);
      const pathname = url.pathname;
      const fullUrl = `${origin}${pathname}`;

      if (origin === window.location.origin) {
        return;
      }

      //store in historty array but inuquly
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory.push(fullUrl);
        return Array.from(new Set(newHistory));
      });
    };

    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [currentUrl]);

  useEffect(() => {
    if (iframeRef.current && currentUrl && currentUrl !== lastUrlRef.current) {
      try {
        const url = new URL(currentUrl);
        url.searchParams.set("in_chatbot", "true");
        console.log("RENDERING", url);
        setIsLoading(true); // Set loading to true when starting to load
        iframeRef.current.src = url.toString();
        lastUrlRef.current = currentUrl;
      } catch (err) {
        console.error("Invalid URL:", currentUrl);
        setIsLoading(false); // Set loading to false if there's an error
      }
    }
  }, [currentUrl]);

  useEffect(() => {
    console.log("HISTORY", history);
  }, [history]);

  const handleBackNavigation = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentUrl(newHistory[newHistory.length - 1]);
    } else if (history.length === 1) {
      // When there's only one item in history, go back to the initial message
      setCurrentUrl(null);
      setHistory([]);
    }
    // Remove the else clause that was calling handleClose()
  };

  const handleClose = () => {
    setIsExpanded(false);
    setCurrentUrl(null);
    setHistory([]);
  };

  const renderChatbotContent = (content: string) => {
    const html = marked(content);
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} onClick={handleContentClick} />;
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest("a");
    if (link) {
      e.preventDefault();
      const href = link.href;
      //add query param to href
      const url = new URL(href);
      url.searchParams.set("in_chatbot", "true");
      setIsExpanded(true);
      setCurrentUrl(url.toString());
      //   if (iframeRef.current) {
      //     iframeRef.current.src = href;
      //   }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn(`bg-white rounded-lg shadow-lg h-[600px] overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-[900px]" : ""}`)}>
      {isExpanded && (
        <div className="bg-gray-100 p-4 flex justify-between items-center">
          <button onClick={handleBackNavigation} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Back
          </button>
          <button onClick={handleClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Close
          </button>
        </div>
      )}
      <div className="h-full overflow-y-auto p-4 relative">
        {(!isExpanded || !currentUrl) && renderChatbotContent(initialMessage)}
        {isExpanded && currentUrl && (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="animate-spin rounded-full size-8 border-b-2 border-gray-900"></div>
              </div>
            )}
            <iframe ref={iframeRef} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" onLoad={handleIframeLoad} />
          </>
        )}
      </div>
    </div>
  );
};

export default ExpandableChatbot;
