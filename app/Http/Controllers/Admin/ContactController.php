<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Contact;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Admin/Contact/Index', [
            'contacts' => $contacts
        ]);
    }

    public function markAsRead($id)
    {
        $contact = Contact::find($id);
        if ($contact) {
            $contact->update(['is_read' => true]);
        }
        return redirect()->back();
    }

    public function markAllAsRead()
    {
        Contact::where('is_read', false)->update(['is_read' => true]);
        return redirect()->back();
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect()->back()->with('success', 'Pesan berhasil dihapus.');
    }
}
