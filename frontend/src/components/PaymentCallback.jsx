import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Backendurl } from '../App';
import { toast } from 'react-toastify';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [paymentData, setPaymentData] = useState(null);
  
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (!reference) {
      setStatus('error');
      toast.error('No payment reference found.');
      setTimeout(() => navigate('/dashboard/payments'), 3000);
      return;
    }

    const verifyTransaction = async () => {
      try {
        const response = await axios.get(`${Backendurl}/api/payment/verify/${reference}`);
        if (response.data.success) {
            setStatus('success');
            setPaymentData(response.data.payment || response.data.data);
            toast.success('Payment verified successfully!');
            setTimeout(() => navigate('/dashboard/payments'), 3000);
        } else {
            setStatus('error');
            toast.error(response.data.message || 'Verification failed');
            setTimeout(() => navigate('/dashboard/payments'), 4000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        toast.error('Payment verification failed.');
        setTimeout(() => navigate('/dashboard/payments'), 4000);
      }
    };

    verifyTransaction();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
            {status === 'verifying' && (
                <>
                    <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we confirm your transaction.</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">Payment Successful!</h2>
                    <p className="text-gray-500 mt-2">
                      {paymentData?.amount ? `GHS ${paymentData.amount.toFixed(2)} paid successfully.` : 'Your payment has been confirmed.'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Redirecting to your dashboard...</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">Verification Failed</h2>
                    <p className="text-gray-500 mt-2">We couldn&apos;t verify your payment. Please try again or contact support.</p>
                    <button
                      onClick={() => navigate('/dashboard/payments')}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Payments
                    </button>
                </>
            )}
        </div>
    </div>
  );
};

export default PaymentCallback;
