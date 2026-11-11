<?php

namespace App\Models;

class Communication extends WorkspaceModel
{
    protected $table = 'communications';

    protected $fillable = ['id', 'payload'];
}
