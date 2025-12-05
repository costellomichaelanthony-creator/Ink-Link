
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Booking, BookingMessage, UserRole, BookingStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createBookingDepositSession } from '../../services/stripeService';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
        fetchBookingData();
        
        const channel = supabase
          .channel('public:booking_messages')
          .on(
            'postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: `booking_id=eq.${id}` },
            (payload) => {
                fetchMessages(); 
            }
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
    }
  }, [id]);

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchBookingData = async () => {
    if (!id) return;
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                artist:profiles!artist_id(display_name, avatar_url),
                client:profiles!client_id(display_name, avatar_url)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        setBooking(data);
        fetchMessages();
    } catch (err) {
        console.error(err);
        navigate('/dashboard');
    }
  };

  const fetchMessages = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('booking_messages')
        .select('*, sender:profiles(display_name)')
        .eq('booking_id', id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as any);
      setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !user || !id) return;

      const { error } = await supabase.from('booking_messages').insert({
          booking_id: id,
          sender_id: user.id,
          message: newMessage.trim()
      });

      if (!error) {
          setNewMessage('');
          fetchMessages();
      }
  };

  const updateStatus = async (newStatus: BookingStatus) => {
      if (!id) return;
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (!error && booking) {
          setBooking({ ...booking, status: newStatus });
      }
  };

  const handlePayDeposit = async () => {
      if (!booking || !user) return;
      // Default deposit example: 20% of min budget or $50 if not set
      const depositAmount = booking.budget_cents_min ? Math.round(booking.budget_cents_min * 0.2) : 5000;
      
      setProcessingPayment(true);
      try {
          await createBookingDepositSession(booking.id, depositAmount, user.id);
      } catch (error: any) {
          alert(error.message || 'Payment failed');
          setProcessingPayment(false);
      }
  };

  if (loading || !booking) return <div className="text-center py-20 text-gray-500">Loading booking...</div>;

  const isArtist = user?.id === booking.artist_id;
  const otherPartyName = isArtist ? booking.client?.display_name : booking.artist?.display_name;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
      {/* Success Notification */}
      {success === 'true' && (
        <div className="mb-4 bg-green-900/50 border border-green-800 text-green-200 p-4 rounded-xl flex items-center justify-between">
           <span><i className="fa-solid fa-check-circle mr-2"></i> Payment Successful! Status updated.</span>
           <button onClick={() => navigate(location.pathname)} className="text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-ink-900 border border-ink-800 rounded-t-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg z-10">
        <div>
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="text-gray-500 hover:text-white"><i className="fa-solid fa-arrow-left"></i></Link>
                <h1 className="text-xl font-bold text-white">Booking with {otherPartyName}</h1>
            </div>
            <p className="text-sm text-gray-400 mt-1 ml-7">
                {new Date(booking.requested_date).toLocaleDateString()} • {booking.requested_time_window}
            </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                booking.status === 'PENDING' ? 'bg-yellow-900/20 text-yellow-200 border-yellow-800' :
                booking.status === 'ACCEPTED' ? 'bg-green-900/20 text-green-200 border-green-800' :
                booking.status === 'DEPOSIT_PAID' ? 'bg-brand/20 text-brand border-brand' :
                booking.status === 'DECLINED' ? 'bg-red-900/20 text-red-200 border-red-800' :
                'bg-gray-800 text-gray-300'
            }`}>
                {booking.status === 'DEPOSIT_PAID' ? 'DEPOSIT PAID' : booking.status}
            </span>

            {/* Actions */}
            {isArtist && booking.status === 'PENDING' && (
                <>
                    <button onClick={() => updateStatus(BookingStatus.DECLINED)} className="px-4 py-2 border border-red-800 text-red-300 rounded hover:bg-red-900/20">Decline</button>
                    <button onClick={() => updateStatus(BookingStatus.ACCEPTED)} className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover">Accept</button>
                </>
            )}
            
            {/* Payment Button for Client */}
            {!isArtist && booking.status === 'ACCEPTED' && (
                <button 
                  onClick={handlePayDeposit} 
                  disabled={processingPayment}
                  className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover shadow-lg shadow-brand/20 flex items-center gap-2"
                >
                    {processingPayment ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-credit-card"></i>}
                    Pay Deposit
                </button>
            )}

            {isArtist && booking.status === 'DEPOSIT_PAID' && (
                <button onClick={() => updateStatus(BookingStatus.COMPLETED)} className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600">Mark Complete</button>
            )}
            
            {!isArtist && booking.status === 'PENDING' && (
                <button onClick={() => updateStatus(BookingStatus.CANCELLED)} className="px-4 py-2 border border-red-800 text-red-300 rounded hover:bg-red-900/20">Cancel Request</button>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row bg-ink-950 border-x border-b border-ink-800 rounded-b-xl overflow-hidden">
        {/* Details Sidebar */}
        <div className="md:w-1/3 bg-ink-900/50 p-6 border-r border-ink-800 overflow-y-auto">
            <h3 className="text-white font-medium mb-4">Request Details</h3>
            
            <div className="space-y-4 text-sm">
                <div>
                    <label className="text-gray-500 block mb-1">Concept</label>
                    <p className="text-gray-300 whitespace-pre-wrap">{booking.description}</p>
                </div>
                <div>
                    <label className="text-gray-500 block mb-1">Budget</label>
                    <p className="text-gray-300">
                        {booking.budget_cents_min ? `$${booking.budget_cents_min / 100}` : '?'} - {booking.budget_cents_max ? `$${booking.budget_cents_max / 100}` : '?'}
                    </p>
                </div>
                 {booking.deposit_amount_cents && booking.deposit_amount_cents > 0 && (
                    <div className="bg-brand/10 p-3 rounded border border-brand/30">
                        <label className="text-brand block mb-1 font-bold">Deposit Paid</label>
                        <p className="text-brand-100">${(booking.deposit_amount_cents / 100).toFixed(2)}</p>
                    </div>
                )}
                <div>
                    <label className="text-gray-500 block mb-1">Created</label>
                    <p className="text-gray-300">{new Date(booking.created_at).toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation.</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-lg ${isMe ? 'bg-brand text-white rounded-br-none' : 'bg-ink-800 text-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-ink-900 border-t border-ink-800 flex gap-2">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-ink-950 border border-ink-700 rounded-lg px-4 py-2 text-white focus:border-brand focus:outline-none"
                />
                <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-brand text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-brand-hover disabled:opacity-50"
                >
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
