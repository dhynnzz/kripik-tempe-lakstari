import './PaymentBanner.css';

const PaymentBanner = () => {
  return (
    <section className="payment-banner">
      <div className="container payment-content">
        <img src="/qris.png" alt="QRIS" className="payment-logo" />
        <img src="/dana.png" alt="DANA" className="payment-logo" />
        <img src="/gopay.png" alt="GoPay" className="payment-logo" />
        <img src="/bri.png" alt="BRI" className="payment-logo" />
      </div>
    </section>
  );
};

export default PaymentBanner;
