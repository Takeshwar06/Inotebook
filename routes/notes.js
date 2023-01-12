const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note')
const router = express.Router();
const { body, validationResult } = require('express-validator')

// ROUTE 1. Fetchall notes using: get "/api/notes/fetchallnotes"  login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2. Add a new note using: Post "/api/notes/addnote"  login required
router.post('/addnote', fetchuser, [
    body("title", "msg--title").isLength({ min: 3 }),
    body("describtion", "msg--describtion").isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, describtion, tag } = req.body;
        // if there are error return bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, describtion, tag, user: req.user.id // (req.user.id) add in Note schema for uniqueness
        })

        const saveNote = await note.save();
        res.json(saveNote);

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal Server Error");
    }

})


// ROUTE 3. Update notes using: put "/api/notes/updatenote"  login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
   const {title,describtion,tag}=req.body;

   try{
    // update a note 
   const newNote={}; 
   // when title des. tag will be come then update it
   if(title){newNote.title=title}
   if(describtion){newNote.describtion=describtion}
   if(tag){newNote.tag=tag}

   // find the note to be updated and update it
   let note = await Note.findById(req.params.id)  // req.params.id is a note id (not a user id)
   if(!note){
   return res.status(404).send("Not found")
   }
   if(note.user.toString()!==req.user.id){
    return res.status(404).send("Not Allowed")
   }
   note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true})
   res.json({note})
   }catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
}

})


// ROUTE 4. Delete note using: delete "/api/notes/deletenote"  login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
   const {title,describtion,tag}=req.body;

   try{
    // find the note to be delete and delete it
   let note = await Note.findById(req.params.id)
   
   if(!note){
   return res.status(404).send("Not found")
   }
   // Allow deletion only if user owns this note
   if(note.user.toString()!==req.user.id){  // carefully see (note.user && req.user.id)
    return res.status(404).send("Not Allowed")
   }
   note = await Note.findByIdAndDelete(req.params.id)
   res.json({"Success":"Note has been deleted",note:note})

   }catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
   }
})



module.exports = router;