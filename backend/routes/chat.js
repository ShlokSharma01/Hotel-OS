const router = require('express').Router();
const Groq = require('groq-sdk');
const { v4: uuidv4 } = require('uuid');
const { ChatLog, Request, MenuItem } = require('../models');
const { authGuest } = require('../middleware/auth');

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are a friendly virtual concierge for Hotel OS. You help guests with:
1. Food & beverage orders (say "ORDER_FOOD:" then list items)
2. Housekeeping requests (say "HOUSEKEEPING:" then describe)
3. Maintenance issues (say "MAINTENANCE:" then describe)
4. Local information and recommendations
5. General hotel queries

When a guest wants to order food, extract the items and respond with: "ORDER_FOOD: [item1 x qty, item2 x qty]"
When requesting housekeeping: "HOUSEKEEPING: [description and time]"
When reporting maintenance: "MAINTENANCE: [issue description]"
Otherwise respond conversationally. Be warm, professional, and concise.
Always address the guest by name if known. Hotel checkout is via the Checkout section.`;

router.post('/message', authGuest, async (req, res) => {
  try {
    const { message, sessionId, guestName } = req.body;
    const sid = sessionId || uuidv4();

    let chatLog = await ChatLog.findOne({ bookingId: req.guest.bookingId, sessionId: sid });
    if (!chatLog) {
      chatLog = await ChatLog.create({
        guestId: req.guest.id,
        bookingId: req.guest.bookingId,
        sessionId: sid,
        messages: []
      });
    }

    chatLog.messages.push({ role: 'user', content: message, timestamp: new Date() });

    const history = chatLog.messages.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + (guestName ? `\nGuest name: ${guestName}` : '') },
        ...history
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    let intent = 'general';
    let actionCreated = null;

    if (reply.includes('ORDER_FOOD:')) {
      intent = 'food';
      const itemsText = reply.split('ORDER_FOOD:')[1].split('\n')[0].trim();
      const menuItems = await MenuItem.find({ isAvailable: true });
      const parsedItems = itemsText.split(',').map(i => {
        const parts = i.trim().split(' x ');
        const name = parts[0].trim();
        const qty = parseInt(parts[1]) || 1;
        const menuItem = menuItems.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
        return { name, quantity: qty, price: menuItem ? menuItem.price : 0 };
      });
      const total = parsedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      actionCreated = await Request.create({
        guestId: req.guest.id,
        bookingId: req.guest.bookingId,
        roomNumber: req.guest.roomNumber,
        type: 'food',
        description: itemsText,
        items: parsedItems,
        totalAmount: total
      });
      req.app.get('io').to('staff-room').emit('new-request', actionCreated);
    } else if (reply.includes('HOUSEKEEPING:')) {
      intent = 'housekeeping';
      const desc = reply.split('HOUSEKEEPING:')[1].split('\n')[0].trim();
      actionCreated = await Request.create({
        guestId: req.guest.id,
        bookingId: req.guest.bookingId,
        roomNumber: req.guest.roomNumber,
        type: 'housekeeping',
        description: desc
      });
      req.app.get('io').to('staff-room').emit('new-request', actionCreated);
    } else if (reply.includes('MAINTENANCE:')) {
      intent = 'maintenance';
      const desc = reply.split('MAINTENANCE:')[1].split('\n')[0].trim();
      actionCreated = await Request.create({
        guestId: req.guest.id,
        bookingId: req.guest.bookingId,
        roomNumber: req.guest.roomNumber,
        type: 'maintenance',
        description: desc
      });
      req.app.get('io').to('staff-room').emit('new-request', actionCreated);
    }

    chatLog.messages.push({ role: 'assistant', content: reply, timestamp: new Date(), intent });
    await chatLog.save();

    res.json({ reply, sessionId: sid, intent, actionCreated });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({
      error: err.message,
      reply: "I'm having trouble connecting right now. Please try again or contact the front desk at extension 0."
    });
  }
});

router.get('/history', authGuest, async (req, res) => {
  try {
    const logs = await ChatLog.find({ bookingId: req.guest.bookingId }).sort('-createdAt').limit(1);
    res.json(logs[0] || { messages: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
