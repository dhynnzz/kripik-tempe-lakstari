import './PaymentBanner.css';

const PaymentBanner = () => {
  return (
    <section className="payment-banner">
      <div className="container payment-content">
        <span className="payment-supported-text">Supported by :</span>
        <img src="/images/payments/qris.png" alt="QRIS" className="payment-logo" />
        <img src="/images/payments/dana.png" alt="DANA" className="payment-logo" />
        <img src="/images/payments/gopay.png" alt="GoPay" className="payment-logo" />
        <img src="/images/payments/all-bank.svg" alt="Transfer Semua Bank" className="payment-logo payment-bank-logo" />
      </div>
    </section>
  );
};

export default PaymentBanner;
