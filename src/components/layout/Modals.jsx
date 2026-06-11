import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';

export default function Modals() {
  const { state, setState } = useContext(AppContext);
  const { activeModal, selectedItem, user } = state; 

  const [gigForm, setGigForm] = useState({ title: '', price: '', loc: '', desc: '' });
  const [newsUrl, setNewsUrl] = useState('');
  const [newsPreview, setNewsPreview] = useState(null);
  const [isFetchingNews, setIsFetchingNews] = useState(false);

  const closeModal = () => {
    setState(prev => ({ ...prev, activeModal: null, selectedItem: null }));
    setNewsPreview(null); setNewsUrl(''); setGigForm({ title: '', price: '', loc: '', desc: '' });
  };

  useEffect(() => {
    if (activeModal && window.lucide) window.lucide.createIcons();
  }, [activeModal, selectedItem, newsPreview]);

  const submitGig = (e) => {
    e.preventDefault();
    const newGig = {
      id: 'g' + Date.now(), type: 'gig',
      host: user ? user.name : 'Anonymous',
      title: gigForm.title, desc: gigForm.desc,
      price: parseFloat(gigForm.price) || 0,
      loc: gigForm.loc || 'Remote', tag: 'New Gig'
    };
    setState(prev => ({ 
      ...prev, data: { ...prev.data, gigs: [newGig, ...prev.data.gigs] }, view: 'gigs', activeModal: null 
    }));
  };

  const fetchNewsMetadata = async () => {
    if (!newsUrl) return alert("Please enter a URL");
    setIsFetchingNews(true);
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(newsUrl)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setNewsPreview({ title: data.data.title || "No title", desc: data.data.description || "No description", url: newsUrl });
      } else throw new Error();
    } catch(e) {
      setNewsPreview({ title: "News from " + new URL(newsUrl).hostname, desc: "Auto-fetched content (demo mode)", url: newsUrl });
    }
    setIsFetchingNews(false);
  };

  const confirmAddNews = () => {
    if (newsPreview) {
      const newItem = { id: 'n' + Date.now(), type: 'news', host: user ? user.name : 'Anonymous', title: newsPreview.title, desc: newsPreview.desc, source: 'Custom', tag: 'User Added' };
      setState(prev => ({ ...prev, data: { ...prev.data, news: [newItem, ...prev.data.news] }, view: 'news', activeModal: null }));
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay ${activeModal ? 'active' : ''}`}>
      <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>
      
      <div className={`relative glass-panel border rounded-[2rem] w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto modal-box ${activeModal === 'modal-gig-detail' || activeModal === 'modal-post' ? 'max-w-2xl' : 'max-w-md'}`}>
        <button onClick={closeModal} className="absolute top-6 right-6 text-sub hover:text-prime"><i data-lucide="x"></i></button>
        
        {activeModal === 'modal-login' && (
          <>
            <h3 className="text-3xl font-black text-prime mb-2">Vennamis</h3>
            <p className="text-xs text-sub mb-8 uppercase tracking-widest">Secure Authentication</p>
            <form onSubmit={(e) => { e.preventDefault(); setState(prev => ({...prev, user: { name: 'Admin User', avatar: 'AU', balance: '$1,500.00', bio: 'Global Worker.' }, activeModal: null })); }} className="space-y-4">
              <input type="email" required placeholder="Encrypted Email" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              <input type="password" required placeholder="Password" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              <button type="submit" className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift" style={{ background: 'var(--primary-glow)' }}>Initialize Session</button>
            </form>
          </>
        )}

        {activeModal === 'modal-post' && (
          <>
            <h3 className="text-2xl font-black text-prime mb-2">Post a New Gig</h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3">
              <i data-lucide="shield-alert" className="text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5"></i>
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Secure Workspace Policy</h4>
                <p className="text-[10px] text-sub mt-1">To protect our community, please avoid sharing external links. Payments secured via Escrow.</p>
              </div>
            </div>
            <form onSubmit={submitGig} className="space-y-4">
              <input type="text" value={gigForm.title} onChange={e => setGigForm({...gigForm, title: e.target.value})} required placeholder="Gig Title" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={gigForm.price} onChange={e => setGigForm({...gigForm, price: e.target.value})} required placeholder="Budget (USD)" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
                <input type="text" value={gigForm.loc} onChange={e => setGigForm({...gigForm, loc: e.target.value})} required placeholder="Location" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]" />
              </div>
              <textarea required value={gigForm.desc} onChange={e => setGigForm({...gigForm, desc: e.target.value})} rows="4" placeholder="Requirements" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-3 text-sm text-prime outline-none focus:border-[var(--primary-glow)]"></textarea>
              <button type="submit" className="w-full rounded-xl py-3.5 text-white font-bold text-sm hover-lift mt-4" style={{ background: 'var(--primary-glow)' }}>Publish Gig</button>
            </form>
          </>
        )}

        {activeModal === 'modal-gig-detail' && selectedItem && (
          <div className="space-y-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-prime mb-2">{selectedItem.title}</h2>
                <span className="text-xs text-sub uppercase tracking-widest border border-[var(--border-line)] px-2 py-1 rounded-lg">{selectedItem.tag || selectedItem.loc || 'Post'}</span>
              </div>
              {selectedItem.price > 0 && <span className="text-2xl font-black glow-text">${selectedItem.price}</span>}
            </div>
            <div className="p-4 surface-bg border rounded-xl mb-6 text-sm text-prime leading-relaxed">{selectedItem.desc}</div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-[var(--border-line)]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">{selectedItem.host[0]}</div>
                <div><p className="text-sm font-bold text-prime">{selectedItem.host}</p><p className="text-[10px] text-[var(--primary-glow)]">Verified User</p></div>
              </div>
              <button onClick={() => { closeModal(); setState(prev => ({...prev, isChatOpen: true, chatHost: selectedItem.host})) }} className="px-4 py-2 rounded-lg text-xs font-bold text-white hover-lift" style={{ background: 'var(--primary-glow)' }}>Message Host</button>
            </div>
          </div>
        )}

        {activeModal === 'modal-add-news' && (
          <>
            <h3 className="text-xl font-black mb-3">Add News Source</h3>
            <input type="url" value={newsUrl} onChange={e => setNewsUrl(e.target.value)} placeholder="https://example.com/article" className="w-full bg-transparent surface-bg border rounded-xl px-4 py-2 mb-3 text-sm outline-none focus:border-[var(--primary-glow)]" />
            <button onClick={fetchNewsMetadata} disabled={isFetchingNews} className="w-full py-2 rounded-xl text-white text-sm mb-3 disabled:opacity-50" style={{ background: 'var(--primary-glow)' }}>
              {isFetchingNews ? 'Fetching...' : 'Fetch & Preview'}
            </button>
            
            {newsPreview && (
              <>
                <div className="p-3 border rounded-xl mb-3 surface-bg">
                  <div className="font-bold text-sm">{newsPreview.title}</div>
                  <div className="text-xs text-sub mt-1">{newsPreview.desc}</div>
                </div>
                <button onClick={confirmAddNews} className="w-full py-2 rounded-xl text-white text-sm" style={{ background: 'var(--primary-glow)' }}>Add to News Feed</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
