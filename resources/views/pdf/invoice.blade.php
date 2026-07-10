<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $booking->booking_code }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .invoice-container {
            width: 100%;
            margin: 0 auto;
        }
        /* Header Table */
        .header-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .header-table td {
            vertical-align: top;
        }
        .logo-cell {
            width: 50%;
        }
        .logo-img {
            max-width: 150px;
            display: block;
        }
        .company-info-cell {
            width: 50%;
            text-align: right;
            font-size: 11px;
            line-height: 1.4;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        /* Title */
        .invoice-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }
        /* Details Table */
        .details-table {
            width: 100%;
            margin-bottom: 30px;
        }
        .details-table td {
            padding: 4px;
            vertical-align: top;
        }
        .col-left {
            width: 15%;
        }
        .col-right {
            width: 35%;
        }
        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background-color: #a4a4a4;
            color: #fff;
            padding: 8px;
            text-align: center;
            border: 1px solid #ccc;
        }
        .items-table td {
            padding: 8px;
            border: 1px solid #ccc;
            text-align: center;
        }
        .items-table .td-left {
            text-align: left;
        }
        .items-table .td-right {
            text-align: right;
        }
        .row-even {
            background-color: #dbeaf9; /* Light blue tint similar to ref */
        }
        .row-odd {
            background-color: #ffffff;
        }
        /* Total Section */
        .total-section {
            background-color: #dbeaf9;
            text-align: right;
            padding: 8px;
            border: 1px solid #ccc;
            margin-top: -1px;
        }
        .total-amount {
            font-weight: bold;
        }
        .paid-stamp {
            color: red;
            font-style: italic;
            font-weight: bold;
        }
        /* Footer */
        .terms {
            font-size: 10px;
            font-style: italic;
            margin-top: 30px;
            margin-bottom: 30px;
        }
        .signatures {
            width: 100%;
            margin-top: 50px;
        }
        .signatures td {
            width: 50%;
            text-align: left;
        }
        .sign-line {
            display: inline-block;
            width: 150px;
            border-bottom: 1px solid #000;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td class="logo-cell">
                    @php
                        // Base64 encode the webp logo so DOMPDF can reliably render it
                        $path = public_path('images/logo-marme.webp');
                        $type = pathinfo($path, PATHINFO_EXTENSION);
                        if(file_exists($path)) {
                            $data = file_get_contents($path);
                            $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                        } else {
                            $base64 = '';
                        }
                    @endphp
                    @if($base64)
                        <img src="{{ $base64 }}" class="logo-img" alt="Marme Villa">
                    @else
                        <h2>MARME VILLA JOGJA</h2>
                    @endif
                </td>
                <td class="company-info-cell">
                    <div class="company-name">MARME VILLA JOGJA</div>
                    Ngemplak, Sleman, Daerah Istimewa Yogyakarta<br>
                    Tlp: +62 851 9008 3940<br>
                    Email: admin@marmevilla.com
                </td>
            </tr>
        </table>

        <!-- Title -->
        <div class="invoice-title">INVOICE</div>

        <!-- Details -->
        <table class="details-table">
            <tr>
                <td class="col-left">Guest Name</td>
                <td class="col-right">: {{ $booking->guest_name }}</td>
                <td class="col-left">Invoice Number</td>
                <td class="col-right">: INV-{{ $booking->booking_code }}</td>
            </tr>
            <tr>
                <td class="col-left">Date / Time</td>
                <td class="col-right">: {{ \Carbon\Carbon::parse($booking->created_at)->translatedFormat('l, d /m/Y') }}</td>
                <td class="col-left">Arrival</td>
                <td class="col-right">: {{ \Carbon\Carbon::parse($booking->check_in)->translatedFormat('d F Y') }}</td>
            </tr>
            <tr>
                <td class="col-left"></td>
                <td class="col-right"></td>
                <td class="col-left">Departure</td>
                <td class="col-right">: {{ \Carbon\Carbon::parse($booking->check_out)->translatedFormat('d F Y') }}</td>
            </tr>
            <tr>
                <td class="col-left"></td>
                <td class="col-right"></td>
                <td class="col-left">Paviliun</td>
                <td class="col-right">: {{ $booking->villa->name ?? 'Villa' }}</td>
            </tr>
            <tr>
                <td class="col-left"></td>
                <td class="col-right"></td>
                <td class="col-left">Type</td>
                <td class="col-right">: Max {{ $booking->villa->max_guests ?? 0 }} Guests</td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th class="td-left" style="width: 50%;">Description</th>
                    <th style="width: 15%;">QTY (Nights)</th>
                    <th style="width: 15%;">TAX %</th>
                    <th class="td-right" style="width: 20%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $nights = \Carbon\Carbon::parse($booking->check_in)->diffInDays(\Carbon\Carbon::parse($booking->check_out));
                    if ($nights == 0) $nights = 1;
                @endphp

                <!-- Room Charge -->
                <tr class="row-even">
                    <td class="td-left">
                        Room Charge 
                        @if($booking->base_price_total > 0)
                           <br><small style="color:#666;">(Termasuk detail harga kustom/akhir pekan)</small>
                        @endif
                    </td>
                    <td>{{ $nights }}</td>
                    <td>0</td>
                    <td class="td-right">IDR. {{ number_format($booking->base_price_total, 0, ',', '.') }}</td>
                </tr>

                <!-- Extra Charge -->
                <tr class="row-odd">
                    <td class="td-left">Service Charge (Extra Guests: {{ $booking->extra_guests }})</td>
                    <td>{{ $booking->extra_guests > 0 ? $nights : '-' }}</td>
                    <td>0</td>
                    <td class="td-right">IDR. {{ number_format($booking->extra_charge_total, 0, ',', '.') }}</td>
                </tr>

                <!-- Discount -->
                <tr class="row-even">
                    <td class="td-left">Discount (Voucher)</td>
                    <td>-</td>
                    <td>0</td>
                    <td class="td-right">- IDR. {{ number_format($booking->discount_amount, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Total Section -->
        <div class="total-section">
            <span style="margin-right: 50px;">TOTAL :</span> 
            <span class="total-amount">IDR. {{ number_format($booking->total_amount, 0, ',', '.') }}</span>
            <br>
            @php
                $paidDate = optional($booking->payments->where('transaction_status', 'settlement')->first())->paid_at;
                $formattedPaidDate = $paidDate ? \Carbon\Carbon::parse($paidDate)->format('d/m/Y') : \Carbon\Carbon::now()->format('d/m/Y');
            @endphp
            <span class="paid-stamp">Midtrans Transfer {{ $formattedPaidDate }} ( PAID ) :</span>
            <span class="paid-stamp">IDR. {{ number_format($booking->total_amount, 0, ',', '.') }}</span>
        </div>

        <!-- Footer -->
        <div class="terms">
            I agree that my liability for this bill is not waived and agree to be held personally liable in the event that the indicated person, Company or Association fails to pay for any part or the full amount of these charges.
        </div>

        <div style="font-weight: bold; margin-bottom: 20px;">
            Thank you for staying with us at MARME VILLA JOGJA.
        </div>

        <table class="signatures">
            <tr>
                <td>Cashier Signature</td>
                <td>Guest Signature</td>
            </tr>
            <tr>
                <td><div class="sign-line"></div></td>
                <td><div class="sign-line"></div></td>
            </tr>
        </table>
    </div>
</body>
</html>
