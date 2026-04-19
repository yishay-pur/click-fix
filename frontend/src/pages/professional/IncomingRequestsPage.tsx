import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FileText,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { Card, Button, Select, Avatar, Modal, Input, PageLoader } from '../../components/common';
import { formatDate, classNames } from '../../utils/helpers';
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS, URGENCY_BG_COLORS, URGENCY_LABELS } from '../../utils/constants';
import { quoteService } from '../../services/quote.service';
import { chatService } from '../../services/chat.service';
import { useAuthStore } from '../../store/authStore';
import type { QuoteRequest } from '../../types/quote.types';

export default function IncomingRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState({
    price: '',
    availability: '',
    notes: '',
    validUntil: '',
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await quoteService.getIncomingRequests();
        setRequests(data.quotes);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        toast.error('שגיאה בטעינת הבקשות');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = statusFilter
    ? requests.filter((r) => r.status === statusFilter)
    : requests;

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const statusOptions = [
    { value: '', label: 'כל הסטטוסים' },
    ...Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  if (isLoading) return <PageLoader />;

  const handleRespond = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedRequest) return;

    if (!responseData.price || !responseData.availability || !responseData.validUntil) {
      toast.error('אנא מלא את כל השדות הנדרשים');
      return;
    }

    setIsSubmitting(true);
    try {
      await quoteService.respond(selectedRequest.id, {
        price: Number(responseData.price),
        availability: responseData.availability,
        notes: responseData.notes || undefined,
        validUntil: new Date(responseData.validUntil),
      });

      toast.success('הצעת המחיר נשלחה בהצלחה!');

      // Refresh requests list
      const data = await quoteService.getIncomingRequests();
      setRequests(data.quotes);

      setShowResponseModal(false);
      setResponseData({ price: '', availability: '', notes: '', validUntil: '' });
    } catch (error: any) {
      console.error('Failed to submit response:', error);
      const errorMessage = error.response?.data?.message || 'שגיאה בשליחת ההצעה';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">
          <FileText className="w-7 h-7 inline ml-2 text-primary-500" />
          בקשות הצעת מחיר
          {pendingCount > 0 && (
            <span className="mr-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-full">
              {pendingCount} חדשות
            </span>
          )}
        </h1>
        <p className="text-secondary-600">
          נהלו את הבקשות שנכנסות מלקוחות פוטנציאליים
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-800 mb-2">
            {statusFilter ? 'אין בקשות בסטטוס זה' : 'אין בקשות חדשות'}
          </h2>
          <p className="text-secondary-600">
            בקשות חדשות יופיעו כאן כאשר לקוחות ישלחו הצעות מחיר
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Customer Info */}
                <div className="flex items-start gap-3 flex-1">
                  <Avatar name={request.customerName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-secondary-800">
                        {request.customerName}
                      </h3>
                      <span className={classNames(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        URGENCY_BG_COLORS[request.urgency]
                      )}>
                        {URGENCY_LABELS[request.urgency]}
                      </span>
                      <span className={classNames(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        QUOTE_STATUS_COLORS[request.status]
                      )}>
                        {QUOTE_STATUS_LABELS[request.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary-500 mt-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(request.createdAt)}
                      {request.responseMethod === 'phone' && (
                        <>
                          <span className="mx-1">•</span>
                          <Phone className="w-4 h-4" />
                          מעדיף שיחה טלפונית
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 lg:flex-shrink-0">
                  {request.status === 'pending' && (
                    <Button onClick={() => handleRespond(request)}>
                      שלח הצעת מחיר
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const chat = await chatService.createChat(
                          Number(request.customerId),
                          Number(user?.id),
                          Number(request.id),
                        );
                        navigate(`/pro/chats/${chat.id}`);
                      } catch (error) {
                        console.error('Failed to start chat:', error);
                        toast.error('שגיאה בפתיחת הצ׳אט');
                      }
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    צ'אט
                  </Button>
                </div>
              </div>

              {/* Request Details */}
              {request.description && (
                <div className="mt-4 pt-4 border-t border-secondary-100">
                  <p className="text-secondary-700">{request.description}</p>
                </div>
              )}

              {/* Answers */}
              {request.answers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-secondary-100">
                  <h4 className="text-sm font-medium text-secondary-600 mb-2">פרטי הבקשה:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {request.answers.map((answer) => (
                      <div key={answer.questionId} className="text-sm">
                        <span className="text-secondary-500">{answer.question}: </span>
                        <span className="text-secondary-800">
                          {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="שליחת הצעת מחיר"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-600">בקשה מאת:</p>
              <p className="font-medium text-secondary-800">{selectedRequest.customerName}</p>
            </div>

            <Input
              label="מחיר מוצע (ש״ח)"
              type="number"
              required
              value={responseData.price}
              onChange={(e) => setResponseData({ ...responseData, price: e.target.value })}
              placeholder="לדוגמה: 350"
            />

            <Input
              label="זמינות"
              required
              value={responseData.availability}
              onChange={(e) => setResponseData({ ...responseData, availability: e.target.value })}
              placeholder="לדוגמה: יום ראשון בבוקר"
            />

            <Input
              label="תוקף ההצעה עד"
              type="date"
              required
              value={responseData.validUntil}
              onChange={(e) => setResponseData({ ...responseData, validUntil: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                הערות נוספות
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 resize-none"
                value={responseData.notes}
                onChange={(e) => setResponseData({ ...responseData, notes: e.target.value })}
                placeholder="פרטים נוספים על ההצעה..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={submitResponse}
                isLoading={isSubmitting}
                fullWidth
                disabled={!responseData.price || !responseData.availability || !responseData.validUntil}
              >
                <CheckCircle className="w-5 h-5" />
                שלח הצעה
              </Button>
              <Button variant="outline" onClick={() => setShowResponseModal(false)}>
                ביטול
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
