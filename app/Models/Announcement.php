<?php

namespace App\Models;

class Announcement extends WorkspaceModel
{
    protected $table = 'announcements';

    protected $fillable = ['id', 'payload'];
}
