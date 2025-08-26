import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Download, Printer, Mail, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceViewProps {
  invoice: any;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onSend?: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ 
  invoice, 
  onClose, 
  onPrint, 
  onDownload, 
  onSend 
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else {
      if (!invoiceRef.current) return;
      
      setIsGeneratingPDF(true);
      try {
        // Create a clone of the invoice content for PDF generation
        const invoiceElement = invoiceRef.current.cloneNode(true) as HTMLElement;
        
        // Remove the close button and action buttons from the PDF
        const actionButtons = invoiceElement.querySelectorAll('.action-buttons, .close-button');
        actionButtons.forEach(button => button.remove());
        
        // Add compact styling for PDF
        invoiceElement.style.padding = '10px';
        invoiceElement.style.backgroundColor = 'white';
        invoiceElement.style.color = 'black';
        invoiceElement.style.fontFamily = 'Arial, sans-serif';
        invoiceElement.style.fontSize = '14px';
        invoiceElement.style.lineHeight = '1.2';
        invoiceElement.style.maxWidth = '800px';
        invoiceElement.style.margin = '0 auto';
        
        // Add PDF-specific class
        invoiceElement.classList.add('pdf-version');
        
        // Make text larger and reduce spacing for PDF
        const allElements = invoiceElement.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          // Make text black for PDF
          if (element.style.color && element.style.color !== 'black') {
            element.style.color = 'black';
          }
          
          // Increase font sizes
          if (element.style.fontSize) {
            const currentSize = parseInt(element.style.fontSize);
            if (currentSize < 16) {
              element.style.fontSize = `${Math.max(currentSize + 2, 14)}px`;
            }
          }
          
          // Reduce margins and padding
          if (element.style.margin) {
            element.style.margin = '4px 0';
          }
          if (element.style.padding) {
            element.style.padding = '6px 8px';
          }
          
          // Special handling for green elements
          if (element.classList.contains('bg-green-600')) {
            element.style.padding = '10px 12px';
            element.style.textAlign = 'center';
          }
          
          // Special handling for gray elements
          if (element.classList.contains('bg-slate-100')) {
            element.style.padding = '12px';
          }
        });
        
        // Specific styling for better PDF layout
        const headers = invoiceElement.querySelectorAll('h1, h2, h3, h4');
        headers.forEach(header => {
          const element = header as HTMLElement;
          element.style.fontSize = '18px';
          element.style.margin = '8px 0';
          element.style.fontWeight = 'bold';
        });
        
        const tables = invoiceElement.querySelectorAll('table, .grid');
        tables.forEach(table => {
          const element = table as HTMLElement;
          element.style.fontSize = '13px';
          element.style.margin = '8px 0';
        });
        
        const buttons = invoiceElement.querySelectorAll('button');
        buttons.forEach(button => {
          const element = button as HTMLElement;
          element.style.display = 'none';
        });
        
        // Temporarily append to body for rendering
        document.body.appendChild(invoiceElement);
        
        // Generate PDF with better settings
        const canvas = await html2canvas(invoiceElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 800,
          height: invoiceElement.scrollHeight
        });
        
        // Remove the temporary element
        document.body.removeChild(invoiceElement);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190; // Slightly smaller than A4 width to add margins
        const pageHeight = 277; // A4 height minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10; // Start with 10mm margin from top
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-print-content, .invoice-print-content * {
              visibility: visible;
            }
            .invoice-print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              padding: 20px;
            }
            .action-buttons, .close-button {
              display: none !important;
            }
          }
          
          .pdf-version {
            padding: 10px !important;
            font-size: 14px !important;
            line-height: 1.2 !important;
          }
          
          .pdf-version h1, .pdf-version h2, .pdf-version h3, .pdf-version h4 {
            font-size: 18px !important;
            margin: 8px 0 !important;
            font-weight: bold !important;
          }
          
          .pdf-version .mb-8 {
            margin-bottom: 16px !important;
          }
          
          .pdf-version .mt-8 {
            margin-top: 16px !important;
          }
          
          .pdf-version .space-y-4 > * + * {
            margin-top: 8px !important;
          }
          
          .pdf-version .space-y-2 > * + * {
            margin-top: 4px !important;
          }
          
          .pdf-version .p-6 {
            padding: 12px !important;
          }
          
          .pdf-version .py-3 {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
          
          .pdf-version .py-2 {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          
          .pdf-version .px-4 {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          .pdf-version .py-2 {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
          
          .pdf-version .py-1 {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
          
          .pdf-version .px-4.py-2 {
            padding: 8px 12px !important;
          }
          
          .pdf-version .px-4.py-1 {
            padding: 6px 12px !important;
          }
          
          .pdf-version .p-3 {
            padding: 10px !important;
          }
          
          .pdf-version .rounded {
            border-radius: 4px !important;
          }
          
          .pdf-version .rounded-t {
            border-radius: 4px 4px 0 0 !important;
          }
          
          .pdf-version .grid {
            gap: 8px !important;
          }
          
          .pdf-version .w-64 {
            width: 200px !important;
          }
          
          .pdf-version .bg-green-600 {
            padding: 10px 12px !important;
            text-align: center !important;
          }
          
          .pdf-version .bg-slate-100 {
            padding: 12px !important;
          }
          
          .pdf-version .text-white {
            color: white !important;
          }
          
          .pdf-version .text-center {
            text-align: center !important;
          }
          
          .pdf-version .text-right {
            text-align: right !important;
          }
          
          .pdf-version .flex {
            display: flex !important;
          }
          
          .pdf-version .justify-between {
            justify-content: space-between !important;
          }
          
          .pdf-version .items-center {
            align-items: center !important;
          }
          
          .pdf-version .items-start {
            align-items: flex-start !important;
          }
        `}
      </style>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto invoice-print-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Invoice #{invoice.invoice_number}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-2 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 action-buttons"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-1 px-3 py-2 text-slate-600 border border-slate-300 rounded hover:bg-slate-50 action-buttons disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download</span>
                </>
              )}
            </button>
            {onSend && (
              <button
                onClick={onSend}
                className="flex items-center space-x-1 px-3 py-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
              >
                <Mail size={16} />
                <span>Send</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 close-button"
            >
              <Eye size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6" ref={invoiceRef}>
          {/* Company Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">LOGO</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Memphis Memblue</h1>
                <p className="text-slate-600">245 Madison Ave, Memphis, Tennessee, US 38103</p>
                <p className="text-slate-600">(918) 849-0075 | info@mem-blue.com</p>
              </div>
            </div>
            
            {/* Invoice Details */}
            <div className="text-right">
              <div className="bg-green-600 text-white px-4 py-2 rounded mb-2">
                <span className="font-semibold">Invoice #{invoice.invoice_number}</span>
              </div>
              <div className="bg-slate-100 p-3 rounded mb-2">
                <div className="text-sm">
                  <div><span className="font-medium">Issued:</span> {format(new Date(invoice.created_at), 'yyyy-MM-dd')}</div>
                  <div><span className="font-medium">Due:</span> {format(new Date(invoice.due_date), 'yyyy-MM-dd')}</div>
                </div>
              </div>
              <div className="bg-green-600 text-white px-4 py-2 rounded">
                <div className="text-sm">Total</div>
                <div className="text-xl font-bold">${Number(invoice.total).toLocaleString()}</div>
              </div>
            </div>
          </div>

                     {/* Customer Information */}
           <div className="mb-8">
             <h3 className="text-sm font-semibold text-slate-700 mb-2">RECIPIENT:</h3>
             <div className="bg-slate-50 p-4 rounded">
               <p className="font-semibold text-slate-900">{invoice.customer_name}</p>
               <p className="text-slate-600">{invoice.customer_address || 'Address not available'}</p>
               {invoice.customer_phone && (
                 <p className="text-slate-600">{invoice.customer_phone}</p>
               )}
               {invoice.customer_email && (
                 <p className="text-slate-600">{invoice.customer_email}</p>
               )}
               {invoice.job_number && (
                 <div className="mt-2 pt-2 border-t border-slate-200">
                   <p className="text-sm text-slate-600">
                     <span className="font-medium">Related Job:</span> {invoice.job_number}
                   </p>
                 </div>
               )}
             </div>
           </div>

          {/* Services Rendered */}
          <div className="mb-8">
            <div className="bg-green-600 text-white px-4 py-2 rounded-t">
              <h3 className="font-semibold">For Services Rendered</h3>
            </div>
            
            {/* Table Header */}
            <div className="bg-green-600 text-white px-4 py-2 grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-3">PRODUCT / SERVICE</div>
              <div className="col-span-4">DESCRIPTION</div>
              <div className="col-span-1">QTY.</div>
              <div className="col-span-2">UNIT PRICE</div>
              <div className="col-span-2">TOTAL</div>
            </div>
            
            {/* Line Items */}
            <div className="border border-slate-200">
              {invoice.line_items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-200 last:border-b-0">
                  <div className="col-span-3 font-medium text-slate-900">{item.description}</div>
                  <div className="col-span-4 text-slate-600">{item.category}</div>
                  <div className="col-span-1 text-slate-900">{item.quantity}</div>
                  <div className="col-span-2 text-slate-900">${Number(item.unit_price).toFixed(2)}</div>
                  <div className="col-span-2 font-medium text-slate-900">${Number(item.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary of Charges */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax Rate ({invoice.tax_rate}%)</span>
                <span className="text-slate-900">${Number(invoice.tax_amount).toFixed(2)}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-green-600">-${Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>${Number(invoice.total).toFixed(2)}</span>
              </div>
              {Number(invoice.paid_amount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Paid Amount</span>
                  <span>${Number(invoice.paid_amount).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.balance_due) > 0 && (
                <div className="flex justify-between font-semibold text-red-600">
                  <span>Balance Due</span>
                  <span>${Number(invoice.balance_due).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Terms and Notes */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Payment Terms</h4>
              <p className="text-slate-600">{invoice.payment_terms || 'Net 30'}</p>
            </div>
            {invoice.notes && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Notes</h4>
                <p className="text-slate-600">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <div className="text-slate-600">
              Thanks for your business!
            </div>
            <div className="flex items-center space-x-2 text-slate-500 text-sm">
              <span>POWERED BY</span>
              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-semibold">MEMBLUE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
