<?php

namespace App\Models;

class Partner extends WorkspaceModel
{
    protected $table = 'partners';

    protected $fillable = ['id', 'payload'];
}
