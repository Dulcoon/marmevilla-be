const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Admin/Reservation/Show.jsx', 'utf8');

// Add imports
content = content.replace(
    "import { Head, Link, router, usePage, useForm } from '@inertiajs/react';",
    `import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { Calendar } from '@/components/ui/calendar';
import { differenceInDays, format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';`
);

// Add states inside ReservationShow
const stateInsertion = `
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: booking.check_in ? parseISO(booking.check_in) : undefined,
        to: booking.check_out ? parseISO(booking.check_out) : undefined,
    });
    
    const dateForm = useForm({
        check_in: booking.check_in,
        check_out: booking.check_out,
    });

    const openEditModal = () => {
        setDateRange({
            from: booking.check_in ? parseISO(booking.check_in) : undefined,
            to: booking.check_out ? parseISO(booking.check_out) : undefined,
        });
        dateForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const handleDateSubmit = (e) => {
        e.preventDefault();
        dateForm.patch(route('reservations.update-dates', booking.id), {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };
    
    // Validate length
    const originalNights = differenceInDays(parseISO(booking.check_out), parseISO(booking.check_in));
    const selectedNights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
    const isDurationValid = selectedNights === originalNights;
`;

content = content.replace(
    "export default function ReservationShow({ booking }) {\n    const { flash } = usePage().props;\n",
    "export default function ReservationShow({ booking }) {\n    const { flash } = usePage().props;\n" + stateInsertion
);

// Update DateRange effect
const effectInsertion = `
    // Update dateForm when dateRange changes
    useState(() => {
        // use an effect
    });
`;
// Let's just do it directly.

fs.writeFileSync('resources/js/Pages/Admin/Reservation/Show.jsx', content);
console.log('patched');
